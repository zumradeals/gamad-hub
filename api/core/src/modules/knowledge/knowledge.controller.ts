import { Body, Controller, Get, Headers, Param, Post, Query } from "@nestjs/common";
import { ok } from "../../common/api-response";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { CreateDocumentVersionDto } from "./dto/create-document-version.dto";
import { DecisionNoteDto } from "./dto/decision-note.dto";
import { KnowledgeService } from "./knowledge.service";

@Controller("documents")
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  async createDocument(@Headers("x-gamad-actor-id") actorId: string | undefined, @Body() dto: CreateDocumentDto) {
    return ok(await this.knowledgeService.createDocument(actorId, dto), {
      events: ["DOCUMENT_CREATED"]
    });
  }

  @Get()
  async listDocuments(
    @Headers("x-gamad-actor-id") actorId: string | undefined,
    @Query("skip") skipRaw?: string,
    @Query("take") takeRaw?: string
  ) {
    return ok(await this.knowledgeService.listDocuments(actorId, { skip: skipRaw ? Number(skipRaw) : undefined, take: takeRaw ? Number(takeRaw) : undefined }));
  }

  @Get(":id")
  async readDocument(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("id") id: string) {
    return ok(await this.knowledgeService.readDocument(actorId, id));
  }

  @Post(":id/versions")
  async addVersion(
    @Headers("x-gamad-actor-id") actorId: string | undefined,
    @Param("id") id: string,
    @Body() dto: CreateDocumentVersionDto
  ) {
    return ok(await this.knowledgeService.addVersion(actorId, id, dto), {
      events: ["DOCUMENT_VERSION_CREATED"]
    });
  }

  @Post(":id/submit")
  async submitDocument(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("id") id: string) {
    return ok(await this.knowledgeService.submitDocument(actorId, id), {
      events: ["DOCUMENT_SUBMITTED"]
    });
  }

  @Post(":id/validate")
  async validateDocument(
    @Headers("x-gamad-actor-id") actorId: string | undefined,
    @Param("id") id: string,
    @Body() dto: DecisionNoteDto
  ) {
    return ok(await this.knowledgeService.validateDocument(actorId, id, dto.decisionNote), {
      events: ["DOCUMENT_VALIDATED"]
    });
  }

  @Post(":id/archive")
  async archiveDocument(
    @Headers("x-gamad-actor-id") actorId: string | undefined,
    @Param("id") id: string,
    @Body() dto: DecisionNoteDto
  ) {
    return ok(await this.knowledgeService.archiveDocument(actorId, id, dto.decisionNote), {
      events: ["DOCUMENT_ARCHIVED"]
    });
  }

  @Get(":id/export")
  async exportDocument(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("id") id: string) {
    return ok(await this.knowledgeService.exportDocument(actorId, id), {
      events: ["DOCUMENT_EXPORTED"]
    });
  }
}
