import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { DocumentStatus, DocumentType, DocumentClassification } from '@prisma/client';

const DOC_INCLUDE = {
  owner: { include: { profile: { select: { displayName: true, avatarUrl: true } } } },
  organizationUnit: { select: { id: true, name: true } },
  versions: {
    include: {
      creator: { include: { profile: { select: { displayName: true } } } },
    },
    orderBy: { createdAt: 'desc' as const },
  },
  _count: { select: { versions: true } },
};

@Injectable()
export class KnowledgeRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Documents ─────────────────────────────────────────────────────────────

  findAll(opts?: {
    unitId?: string;
    status?: string;
    classification?: string;
    documentType?: string;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};
    if (opts?.unitId) where.organizationUnitId = opts.unitId;
    if (opts?.status) where.status = opts.status as DocumentStatus;
    if (opts?.classification) where.classification = opts.classification as DocumentClassification;
    if (opts?.documentType) where.documentType = opts.documentType as DocumentType;
    return this.prisma.document.findMany({
      where,
      include: {
        owner: { include: { profile: { select: { displayName: true } } } },
        organizationUnit: { select: { id: true, name: true } },
        _count: { select: { versions: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip: opts?.skip ?? 0,
      take: opts?.take ?? 30,
    });
  }

  findById(id: string) {
    return this.prisma.document.findUnique({ where: { id }, include: DOC_INCLUDE });
  }

  create(data: {
    title: string;
    ownerId: string;
    documentType?: DocumentType;
    classification?: DocumentClassification;
    organizationUnitId?: string;
  }) {
    return this.prisma.document.create({ data, include: DOC_INCLUDE });
  }

  updateStatus(id: string, status: DocumentStatus) {
    return this.prisma.document.update({ where: { id }, data: { status }, include: DOC_INCLUDE });
  }

  // ── Versions ──────────────────────────────────────────────────────────────

  addVersion(data: {
    documentId: string;
    versionNumber: string;
    fileUrl: string;
    checksum?: string;
    createdBy: string;
  }) {
    return this.prisma.documentVersion.create({
      data,
      include: {
        creator: { include: { profile: { select: { displayName: true } } } },
      },
    });
  }

  findLatestVersion(documentId: string) {
    return this.prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
