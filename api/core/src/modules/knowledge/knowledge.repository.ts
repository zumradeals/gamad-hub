import { Injectable } from "@nestjs/common";
import { DocumentClassification, DocumentStatus, DocumentType } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class KnowledgeRepository {
  constructor(private readonly prisma: PrismaService) {}

  listDocuments(params: { skip: number; take: number }) {
    return this.prisma.document.findMany({
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        documentType: true,
        classification: true,
        status: true,
        createdAt: true,
        owner: { select: { profile: { select: { displayName: true } } } },
        organizationUnit: { select: { id: true, name: true } },
        versions: { select: { versionNumber: true }, orderBy: { createdAt: "desc" }, take: 1 }
      }
    });
  }

  countDocuments() {
    return this.prisma.document.count();
  }

  createDocument(data: {
    title: string;
    documentType: DocumentType;
    classification: DocumentClassification;
    organizationUnitId?: string;
    ownerId: string;
  }) {
    return this.prisma.document.create({
      data
    });
  }

  findDocument(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { createdAt: "desc" } },
        owner: { include: { profile: true } },
        organizationUnit: true
      }
    });
  }

  updateDocumentStatus(id: string, status: DocumentStatus) {
    return this.prisma.document.update({
      where: { id },
      data: { status }
    });
  }

  createVersion(data: {
    documentId: string;
    versionNumber: string;
    fileUrl: string;
    checksum: string;
    createdBy: string;
  }) {
    return this.prisma.documentVersion.create({
      data
    });
  }
}
