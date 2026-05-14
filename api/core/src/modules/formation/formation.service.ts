import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { FormationRepository } from './formation.repository';
import { AuditService } from '../audit/audit.service';
import { CreateFormationDto } from './dto/create-formation.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { FormationStatus, EnrollmentStatus } from '@prisma/client';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class FormationService {
  constructor(
    private readonly repo: FormationRepository,
    private readonly audit: AuditService,
  ) {}

  // ── Formations ────────────────────────────────────────────────────────────

  findAll(opts?: { status?: string; isPublic?: boolean; skip?: number; take?: number }) {
    return this.repo.findAll(opts);
  }

  async findById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Formation introuvable');
    return item;
  }

  async create(dto: CreateFormationDto, actorId: string) {
    const baseSlug = slugify(dto.title);
    let slug = baseSlug;
    let attempt = 0;
    while (await this.repo.findBySlug(slug)) {
      slug = `${baseSlug}-${++attempt}`;
    }

    const formation = await this.repo.create({
      title: dto.title,
      slug,
      description: dto.description,
      imageUrl: dto.imageUrl,
      isPublic: dto.isPublic ?? false,
    });

    await this.audit.createEvent({
      actorId,
      action: 'FORMATION_CREATED',
      targetType: 'Formation',
      targetId: formation.id,
      newValue: { title: formation.title, slug: formation.slug, isPublic: formation.isPublic },
    });

    return formation;
  }

  async update(id: string, dto: UpdateFormationDto, actorId: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Formation introuvable');
    if (existing.status === FormationStatus.ARCHIVED) {
      throw new BadRequestException('Impossible de modifier une formation archivée');
    }

    const updated = await this.repo.update(id, dto);

    await this.audit.createEvent({
      actorId,
      action: 'FORMATION_UPDATED',
      targetType: 'Formation',
      targetId: id,
      oldValue: { title: existing.title, description: existing.description },
      newValue: dto,
    });

    return updated;
  }

  async publish(id: string, actorId: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Formation introuvable');
    if (existing.status !== FormationStatus.DRAFT) {
      throw new BadRequestException(`Impossible de publier — statut actuel : ${existing.status}`);
    }
    const moduleCount = await this.repo.countModules(id);
    if (moduleCount === 0) {
      throw new BadRequestException('Une formation doit avoir au moins un module pour être publiée');
    }

    const updated = await this.repo.update(id, { status: FormationStatus.PUBLISHED });

    await this.audit.createEvent({
      actorId,
      action: 'FORMATION_PUBLISHED',
      targetType: 'Formation',
      targetId: id,
      oldValue: { status: 'DRAFT' },
      newValue: { status: 'PUBLISHED' },
    });

    return updated;
  }

  async archive(id: string, actorId: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Formation introuvable');
    if (existing.status === FormationStatus.ARCHIVED) {
      throw new BadRequestException('Cette formation est déjà archivée');
    }

    const updated = await this.repo.update(id, { status: FormationStatus.ARCHIVED });

    await this.audit.createEvent({
      actorId,
      action: 'FORMATION_ARCHIVED',
      targetType: 'Formation',
      targetId: id,
      oldValue: { status: existing.status },
      newValue: { status: 'ARCHIVED' },
    });

    return updated;
  }

  // ── Modules ───────────────────────────────────────────────────────────────

  async findModules(formationId: string) {
    await this.findById(formationId);
    return this.repo.findModules(formationId);
  }

  async addModule(formationId: string, dto: CreateModuleDto, actorId: string) {
    const formation = await this.repo.findById(formationId);
    if (!formation) throw new NotFoundException('Formation introuvable');
    if (formation.status === FormationStatus.ARCHIVED) {
      throw new BadRequestException('Impossible d\'ajouter un module à une formation archivée');
    }

    const existingModules = await this.repo.findModules(formationId);
    const order = dto.order ?? existingModules.length;

    const mod = await this.repo.createModule({
      formationId,
      title: dto.title,
      description: dto.description,
      order,
      durationMin: dto.durationMin,
    });

    await this.audit.createEvent({
      actorId,
      action: 'FORMATION_MODULE_ADDED',
      targetType: 'FormationModule',
      targetId: mod.id,
      newValue: { formationId, title: mod.title, order: mod.order },
    });

    return mod;
  }

  async updateModule(formationId: string, moduleId: string, dto: CreateModuleDto, actorId: string) {
    const mod = await this.repo.findModuleById(moduleId);
    if (!mod || mod.formationId !== formationId) {
      throw new NotFoundException('Module introuvable dans cette formation');
    }

    const updated = await this.repo.updateModule(moduleId, {
      title: dto.title,
      description: dto.description,
      order: dto.order,
      durationMin: dto.durationMin,
    });

    await this.audit.createEvent({
      actorId,
      action: 'FORMATION_MODULE_UPDATED',
      targetType: 'FormationModule',
      targetId: moduleId,
      oldValue: { title: mod.title, order: mod.order },
      newValue: dto,
    });

    return updated;
  }

  async deleteModule(formationId: string, moduleId: string, actorId: string) {
    const mod = await this.repo.findModuleById(moduleId);
    if (!mod || mod.formationId !== formationId) {
      throw new NotFoundException('Module introuvable dans cette formation');
    }

    await this.repo.deleteModule(moduleId);

    await this.audit.createEvent({
      actorId,
      action: 'FORMATION_MODULE_DELETED',
      targetType: 'FormationModule',
      targetId: moduleId,
      oldValue: { formationId, title: mod.title },
    });

    return { success: true, moduleId };
  }

  // ── Enrollments ───────────────────────────────────────────────────────────

  async findEnrollments(formationId: string) {
    await this.findById(formationId);
    const formation = await this.repo.findById(formationId);
    return (formation as any)?.enrollments ?? [];
  }

  findMyEnrollments(gamadId: string) {
    return this.repo.findEnrollmentsByGamadId(gamadId);
  }

  async enroll(formationId: string, gamadId: string, actorId: string) {
    const formation = await this.repo.findById(formationId);
    if (!formation) throw new NotFoundException('Formation introuvable');
    if (formation.status !== FormationStatus.PUBLISHED) {
      throw new BadRequestException('Inscription possible uniquement sur une formation publiée');
    }

    const existing = await this.repo.findEnrollment(gamadId, formationId);
    if (existing && existing.status !== EnrollmentStatus.CANCELLED) {
      throw new ConflictException('Déjà inscrit à cette formation');
    }

    const enrollment = existing
      ? await this.repo.updateEnrollmentStatus(gamadId, formationId, EnrollmentStatus.ENROLLED)
      : await this.repo.createEnrollment(gamadId, formationId);

    await this.audit.createEvent({
      actorId,
      action: 'FORMATION_ENROLLED',
      targetType: 'FormationEnrollment',
      targetId: formationId,
      newValue: { gamadId, formationId },
    });

    return enrollment;
  }

  async unenroll(formationId: string, gamadId: string, actorId: string) {
    const enrollment = await this.repo.findEnrollment(gamadId, formationId);
    if (!enrollment || enrollment.status === EnrollmentStatus.CANCELLED) {
      throw new NotFoundException('Inscription introuvable');
    }
    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new BadRequestException('Impossible de se désinscrire d\'une formation terminée');
    }

    await this.repo.updateEnrollmentStatus(gamadId, formationId, EnrollmentStatus.CANCELLED);

    await this.audit.createEvent({
      actorId,
      action: 'FORMATION_UNENROLLED',
      targetType: 'FormationEnrollment',
      targetId: formationId,
      newValue: { gamadId, formationId },
    });

    return { success: true, gamadId, formationId };
  }

  // ── Progress ──────────────────────────────────────────────────────────────

  async completeModule(formationId: string, moduleId: string, gamadId: string, actorId: string) {
    const enrollment = await this.repo.findEnrollment(gamadId, formationId);
    if (!enrollment || enrollment.status === EnrollmentStatus.CANCELLED) {
      throw new BadRequestException('Vous devez être inscrit à cette formation');
    }

    const existing = await this.repo.findCompletion(gamadId, moduleId);
    if (existing) throw new ConflictException('Ce module est déjà marqué comme terminé');

    const completion = await this.repo.createCompletion(gamadId, moduleId);

    const [totalModules, completedModules] = await Promise.all([
      this.repo.countModules(formationId),
      this.repo.countCompletions(gamadId, formationId),
    ]);

    if (totalModules > 0 && completedModules >= totalModules) {
      await this.repo.updateEnrollmentStatus(gamadId, formationId, EnrollmentStatus.COMPLETED);
      await this.audit.createEvent({
        actorId,
        action: 'FORMATION_COMPLETED',
        targetType: 'FormationEnrollment',
        targetId: formationId,
        newValue: { gamadId, formationId, completedAt: new Date() },
      });
    } else if (enrollment.status === EnrollmentStatus.ENROLLED) {
      await this.repo.updateEnrollmentStatus(gamadId, formationId, EnrollmentStatus.IN_PROGRESS);
    }

    await this.audit.createEvent({
      actorId,
      action: 'MODULE_COMPLETED',
      targetType: 'ModuleCompletion',
      targetId: moduleId,
      newValue: { gamadId, moduleId, formationId },
    });

    return { completion, progress: { completed: completedModules, total: totalModules } };
  }

  async getProgress(formationId: string, gamadId: string) {
    const enrollment = await this.repo.findEnrollment(gamadId, formationId);
    if (!enrollment) throw new NotFoundException('Aucune inscription pour ce citoyen');

    const [completions, totalModules] = await Promise.all([
      this.repo.findCompletionsByEnrollment(gamadId, formationId),
      this.repo.countModules(formationId),
    ]);

    return {
      gamadId,
      formationId,
      enrollmentStatus: enrollment.status,
      completedModules: completions.length,
      totalModules,
      percentage: totalModules > 0 ? Math.round((completions.length / totalModules) * 100) : 0,
      completions,
    };
  }
}
