import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DocumentStatus, DocumentType, DocumentClassification } from '@prisma/client';
import { KnowledgeRepository } from './knowledge.repository';
import { AuditService } from '../audit/audit.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { AddVersionDto } from './dto/add-version.dto';

const SUBMIT_FROM: DocumentStatus[] = [DocumentStatus.DRAFT];
const VALIDATE_FROM: DocumentStatus[] = [DocumentStatus.SUBMITTED];
const ARCHIVE_FROM: DocumentStatus[] = [
  DocumentStatus.DRAFT,
  DocumentStatus.VALIDATED,
];

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly repo: KnowledgeRepository,
    private readonly audit: AuditService,
  ) {}

  // ── Documents ─────────────────────────────────────────────────────────────

  findAll(opts?: {
    unitId?: string;
    status?: string;
    classification?: string;
    documentType?: string;
    skip?: number;
    take?: number;
  }) {
    return this.repo.findAll(opts);
  }

  async findById(id: string) {
    const doc = await this.repo.findById(id);
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async create(actorId: string, dto: CreateDocumentDto) {
    const doc = await this.repo.create({
      title: dto.title,
      ownerId: actorId,
      documentType: (dto.documentType as DocumentType) ?? DocumentType.MANUAL,
      classification: (dto.classification as DocumentClassification) ?? DocumentClassification.INTERNAL,
      organizationUnitId: dto.organizationUnitId,
    });
    await this.audit.createEvent({
      actorId,
      action: 'DOCUMENT_CREATED',
      targetType: 'Document',
      targetId: doc.id,
      metadata: { title: doc.title, classification: doc.classification },
    });
    return doc;
  }

  private async requireDoc(id: string) {
    const doc = await this.repo.findById(id);
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async submit(actorId: string, id: string) {
    const doc = await this.requireDoc(id);
    if (!SUBMIT_FROM.includes(doc.status)) {
      throw new BadRequestException(`Cannot submit a document with status ${doc.status}`);
    }
    const latest = await this.repo.findLatestVersion(id);
    if (!latest) throw new ForbiddenException('Cannot submit a document with no versions');
    const updated = await this.repo.updateStatus(id, DocumentStatus.SUBMITTED);
    await this.audit.createEvent({
      actorId,
      action: 'DOCUMENT_SUBMITTED',
      targetType: 'Document',
      targetId: id,
    });
    return updated;
  }

  async validate(actorId: string, id: string) {
    const doc = await this.requireDoc(id);
    if (!VALIDATE_FROM.includes(doc.status)) {
      throw new BadRequestException(`Cannot validate a document with status ${doc.status}`);
    }
    const updated = await this.repo.updateStatus(id, DocumentStatus.VALIDATED);
    await this.audit.createEvent({
      actorId,
      action: 'DOCUMENT_VALIDATED',
      targetType: 'Document',
      targetId: id,
    });
    return updated;
  }

  async archive(actorId: string, id: string) {
    const doc = await this.requireDoc(id);
    if (!ARCHIVE_FROM.includes(doc.status)) {
      throw new BadRequestException(`Cannot archive a document with status ${doc.status}`);
    }
    const updated = await this.repo.updateStatus(id, DocumentStatus.ARCHIVED);
    await this.audit.createEvent({
      actorId,
      action: 'DOCUMENT_ARCHIVED',
      targetType: 'Document',
      targetId: id,
    });
    return updated;
  }

  async export(actorId: string, id: string) {
    const doc = await this.requireDoc(id);
    await this.audit.createEvent({
      actorId,
      action: 'DOCUMENT_EXPORTED',
      targetType: 'Document',
      targetId: id,
    });
    return doc;
  }

  // ── Versions ──────────────────────────────────────────────────────────────

  async addVersion(actorId: string, documentId: string, dto: AddVersionDto) {
    const doc = await this.requireDoc(documentId);
    if (doc.status === DocumentStatus.ARCHIVED) {
      throw new ForbiddenException('Cannot add versions to an archived document');
    }
    const version = await this.repo.addVersion({
      documentId,
      versionNumber: dto.versionNumber,
      fileUrl: dto.fileUrl,
      checksum: dto.checksum,
      createdBy: actorId,
    });
    await this.audit.createEvent({
      actorId,
      action: 'DOCUMENT_VERSION_CREATED',
      targetType: 'DocumentVersion',
      targetId: version.id,
      metadata: { documentId, versionNumber: dto.versionNumber },
    });
    return version;
  }
}
