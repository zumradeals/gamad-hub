import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { FormationStatus, EnrollmentStatus } from '@prisma/client';

const FORMATION_INCLUDE = {
  modules: { orderBy: { order: 'asc' as const } },
  _count: { select: { enrollments: true, modules: true } },
};

@Injectable()
export class FormationRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Formations ────────────────────────────────────────────────────────────

  findAll(opts?: { status?: string; isPublic?: boolean; skip?: number; take?: number }) {
    const where: any = {};
    if (opts?.status) where.status = opts.status as FormationStatus;
    if (opts?.isPublic !== undefined) where.isPublic = opts.isPublic;
    return this.prisma.formation.findMany({
      where,
      include: FORMATION_INCLUDE,
      skip: opts?.skip ?? 0,
      take: opts?.take ?? 20,
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.formation.findUnique({
      where: { id },
      include: {
        ...FORMATION_INCLUDE,
        enrollments: {
          include: { gamad: { include: { profile: true } } },
          orderBy: { enrolledAt: 'desc' },
          take: 50,
        },
      },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.formation.findUnique({ where: { slug }, include: FORMATION_INCLUDE });
  }

  create(data: {
    title: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    isPublic?: boolean;
  }) {
    return this.prisma.formation.create({
      data: { ...data, status: FormationStatus.DRAFT },
      include: FORMATION_INCLUDE,
    });
  }

  update(id: string, data: Partial<{
    title: string;
    description: string;
    imageUrl: string;
    isPublic: boolean;
    status: FormationStatus;
  }>) {
    return this.prisma.formation.update({ where: { id }, data, include: FORMATION_INCLUDE });
  }

  // ── Modules ───────────────────────────────────────────────────────────────

  findModules(formationId: string) {
    return this.prisma.formationModule.findMany({
      where: { formationId },
      orderBy: { order: 'asc' },
    });
  }

  findModuleById(id: string) {
    return this.prisma.formationModule.findUnique({ where: { id } });
  }

  createModule(data: {
    formationId: string;
    title: string;
    description?: string;
    order?: number;
    durationMin?: number;
  }) {
    return this.prisma.formationModule.create({ data });
  }

  updateModule(id: string, data: Partial<{
    title: string;
    description: string;
    order: number;
    durationMin: number;
  }>) {
    return this.prisma.formationModule.update({ where: { id }, data });
  }

  async deleteModule(id: string) {
    await this.prisma.moduleCompletion.deleteMany({ where: { moduleId: id } });
    return this.prisma.formationModule.delete({ where: { id } });
  }

  // ── Enrollments ───────────────────────────────────────────────────────────

  findEnrollment(gamadId: string, formationId: string) {
    return this.prisma.formationEnrollment.findUnique({
      where: { gamadId_formationId: { gamadId, formationId } },
    });
  }

  findEnrollmentsByGamadId(gamadId: string) {
    return this.prisma.formationEnrollment.findMany({
      where: { gamadId },
      include: { formation: { include: FORMATION_INCLUDE } },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  createEnrollment(gamadId: string, formationId: string) {
    return this.prisma.formationEnrollment.create({
      data: { gamadId, formationId, status: EnrollmentStatus.ENROLLED },
      include: { formation: true },
    });
  }

  updateEnrollmentStatus(gamadId: string, formationId: string, status: EnrollmentStatus) {
    return this.prisma.formationEnrollment.update({
      where: { gamadId_formationId: { gamadId, formationId } },
      data: {
        status,
        completedAt: status === EnrollmentStatus.COMPLETED ? new Date() : undefined,
      },
    });
  }

  // ── Module Completions ────────────────────────────────────────────────────

  findCompletion(gamadId: string, moduleId: string) {
    return this.prisma.moduleCompletion.findUnique({
      where: { gamadId_moduleId: { gamadId, moduleId } },
    });
  }

  findCompletionsByEnrollment(gamadId: string, formationId: string) {
    return this.prisma.moduleCompletion.findMany({
      where: {
        gamadId,
        module: { formationId },
      },
      include: { module: true },
    });
  }

  createCompletion(gamadId: string, moduleId: string) {
    return this.prisma.moduleCompletion.create({
      data: { gamadId, moduleId },
      include: { module: true },
    });
  }

  countModules(formationId: string) {
    return this.prisma.formationModule.count({ where: { formationId } });
  }

  countCompletions(gamadId: string, formationId: string) {
    return this.prisma.moduleCompletion.count({
      where: { gamadId, module: { formationId } },
    });
  }
}
