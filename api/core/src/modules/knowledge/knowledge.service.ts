import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DocumentClassification, DocumentStatus, DocumentType } from "@prisma/client";
import { AuditService } from "../audit/audit.service";
import { PermissionsService } from "../permissions/permissions.service";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { CreateDocumentVersionDto } from "./dto/create-document-version.dto";
import { KnowledgeRepository } from "./knowledge.repository";

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly knowledgeRepository: KnowledgeRepository,
    private readonly permissionsService: PermissionsService,
    private readonly auditService: AuditService
  ) {}

  async listDocuments(actorId: string | undefined, query?: { skip?: number; take?: number }) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "document.read" });
    const skip = Math.max(query?.skip ?? 0, 0);
    const take = Math.min(Math.max(query?.take ?? 100, 1), 500);
    const [items, total] = await Promise.all([
      this.knowledgeRepository.listDocuments({ skip, take }),
      this.knowledgeRepository.countDocuments()
    ]);
    return { items, total, skip, take };
  }

  async createDocument(actorId: string | undefined, dto: CreateDocumentDto) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "document.create", organizationUnitId: dto.organizationUnitId });
    this.assertTitle(dto.title);

    const document = await this.knowledgeRepository.createDocument({
      title: dto.title,
      documentType: this.toDocumentType(dto.documentType),
      classification: this.toClassification(dto.classification),
      organizationUnitId: dto.organizationUnitId,
      ownerId: actorId ?? ""
    });

    await this.auditService.writeAudit({
      actorId,
      action: "DOCUMENT_CREATED",
      targetType: "DOCUMENT",
      targetId: document.id,
      organizationUnitId: document.organizationUnitId ?? undefined,
      newValue: document
    });
    this.auditService.emitEvent("DOCUMENT_CREATED", { documentId: document.id }, { actorId, targetType: "DOCUMENT", targetId: document.id });

    return document;
  }

  async addVersion(actorId: string | undefined, documentId: string, dto: CreateDocumentVersionDto) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "document.update" });
    const document = await this.assertDocument(documentId);
    if (document.status === "ARCHIVED") {
      throw new BadRequestException("Archived document cannot be modified");
    }
    if (!dto.versionNumber || !dto.fileUrl || !dto.checksum) {
      throw new BadRequestException("versionNumber, fileUrl and checksum are required");
    }

    const version = await this.knowledgeRepository.createVersion({
      documentId,
      versionNumber: dto.versionNumber,
      fileUrl: dto.fileUrl,
      checksum: dto.checksum,
      createdBy: actorId ?? ""
    });

    await this.auditService.writeAudit({
      actorId,
      action: "DOCUMENT_VERSION_CREATED",
      targetType: "DOCUMENT",
      targetId: documentId,
      organizationUnitId: document.organizationUnitId ?? undefined,
      newValue: version
    });
    this.auditService.emitEvent("DOCUMENT_VERSION_CREATED", { documentId, versionId: version.id }, { actorId, targetType: "DOCUMENT", targetId: documentId });

    return version;
  }

  async readDocument(actorId: string | undefined, documentId: string) {
    const document = await this.assertDocument(documentId);
    await this.permissionsService.assertPermission({
      actorId: actorId ?? "",
      permissionCode: "document.read",
      organizationUnitId: document.organizationUnitId ?? undefined,
      resourceClassification: document.classification
    });

    return document;
  }

  async submitDocument(actorId: string | undefined, documentId: string) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "document.update" });
    const before = await this.assertDocument(documentId);
    const updated = await this.knowledgeRepository.updateDocumentStatus(documentId, DocumentStatus.SUBMITTED);
    await this.auditService.writeAudit({
      actorId,
      action: "DOCUMENT_SUBMITTED",
      targetType: "DOCUMENT",
      targetId: documentId,
      organizationUnitId: before.organizationUnitId ?? undefined,
      oldValue: { status: before.status },
      newValue: { status: updated.status }
    });
    this.auditService.emitEvent("DOCUMENT_SUBMITTED", { documentId }, { actorId, targetType: "DOCUMENT", targetId: documentId });
    return updated;
  }

  async validateDocument(actorId: string | undefined, documentId: string, decisionNote: string) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "document.validate" });
    if (!decisionNote?.trim()) {
      throw new BadRequestException("decisionNote is required");
    }
    const before = await this.assertDocument(documentId);
    const updated = await this.knowledgeRepository.updateDocumentStatus(documentId, DocumentStatus.VALIDATED);
    await this.auditService.writeAudit({
      actorId,
      action: "DOCUMENT_VALIDATED",
      targetType: "DOCUMENT",
      targetId: documentId,
      organizationUnitId: before.organizationUnitId ?? undefined,
      oldValue: { status: before.status },
      newValue: { status: updated.status, decisionNote }
    });
    this.auditService.emitEvent("DOCUMENT_VALIDATED", { documentId }, { actorId, targetType: "DOCUMENT", targetId: documentId });
    return updated;
  }

  async archiveDocument(actorId: string | undefined, documentId: string, decisionNote: string) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "document.archive" });
    const before = await this.assertDocument(documentId);
    const updated = await this.knowledgeRepository.updateDocumentStatus(documentId, DocumentStatus.ARCHIVED);
    await this.auditService.writeAudit({
      actorId,
      action: "DOCUMENT_ARCHIVED",
      targetType: "DOCUMENT",
      targetId: documentId,
      organizationUnitId: before.organizationUnitId ?? undefined,
      oldValue: { status: before.status },
      newValue: { status: updated.status, decisionNote }
    });
    this.auditService.emitEvent("DOCUMENT_ARCHIVED", { documentId }, { actorId, targetType: "DOCUMENT", targetId: documentId });
    return updated;
  }

  async exportDocument(actorId: string | undefined, documentId: string) {
    const document = await this.assertDocument(documentId);
    await this.permissionsService.assertPermission({
      actorId: actorId ?? "",
      permissionCode: "document.export",
      organizationUnitId: document.organizationUnitId ?? undefined,
      resourceClassification: document.classification
    });

    await this.auditService.writeAudit({
      actorId,
      action: "DOCUMENT_EXPORTED",
      targetType: "DOCUMENT",
      targetId: documentId,
      organizationUnitId: document.organizationUnitId ?? undefined,
      newValue: { classification: document.classification }
    });
    this.auditService.emitEvent("DOCUMENT_EXPORTED", { documentId }, { actorId, targetType: "DOCUMENT", targetId: documentId });

    return document;
  }

  private async assertDocument(documentId: string) {
    const document = await this.knowledgeRepository.findDocument(documentId);
    if (!document) {
      throw new NotFoundException("Document not found");
    }
    return document;
  }

  private assertTitle(title: string) {
    if (!title?.trim()) {
      throw new BadRequestException("title is required");
    }
  }

  private toDocumentType(value: string) {
    const normalized = value.toUpperCase();
    if (!["STATUTE", "REPORT", "MANUAL", "PROCEDURE", "MEDIA", "ARCHIVE", "TRAINING"].includes(normalized)) {
      throw new BadRequestException("invalid document type");
    }
    return normalized as DocumentType;
  }

  private toClassification(value: string) {
    const normalized = value.toUpperCase();
    if (!["PUBLIC", "INTERNAL", "CONFIDENTIAL", "STRATEGIC"].includes(normalized)) {
      throw new BadRequestException("invalid document classification");
    }
    return normalized as DocumentClassification;
  }
}
