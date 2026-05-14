import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ActorId as Actor } from '../../common/decorators/actor.decorator';
import { CreateDocumentDto } from './dto/create-document.dto';
import { AddVersionDto } from './dto/add-version.dto';

@UseGuards(PermissionGuard)
@Controller('documents')
export class KnowledgeController {
  constructor(private readonly service: KnowledgeService) {}

  @Get()
  findAll(
    @Query('unitId') unitId?: string,
    @Query('status') status?: string,
    @Query('classification') classification?: string,
    @Query('documentType') documentType?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(30), ParseIntPipe) take?: number,
  ) {
    return this.service.findAll({ unitId, status, classification, documentType, skip, take });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Actor() actorId: string, @Body() dto: CreateDocumentDto) {
    return this.service.create(actorId, dto);
  }

  @Post(':id/versions')
  addVersion(
    @Actor() actorId: string,
    @Param('id') id: string,
    @Body() dto: AddVersionDto,
  ) {
    return this.service.addVersion(actorId, id, dto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  submit(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.submit(actorId, id);
  }

  @Post(':id/validate')
  @HttpCode(HttpStatus.OK)
  validate(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.validate(actorId, id);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  archive(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.archive(actorId, id);
  }

  @Get(':id/export')
  export(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.export(actorId, id);
  }
}
