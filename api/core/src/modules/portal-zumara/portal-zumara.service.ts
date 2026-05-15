import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PortalZumaraRepository } from './portal-zumara.repository';
import { CreateZumaraRequestDto } from './dto/create-zumara-request.dto';
import { ZumaraType } from '@prisma/client';

@Injectable()
export class PortalZumaraService {
  constructor(private readonly repo: PortalZumaraRepository) {}

  listPublic(type?: ZumaraType, country?: string, city?: string) {
    return this.repo.findPublicCells({ type, country, city });
  }

  async getBySlug(slug: string) {
    const cell = await this.repo.findCellBySlug(slug);
    if (!cell) throw new NotFoundException('Zumara introuvable');
    return cell;
  }

  getSuggestions(country: string) {
    return this.repo.findSuggestions(country);
  }

  submitRequest(gamadId: string, dto: CreateZumaraRequestDto) {
    return this.repo.createRequest({ gamadId, ...dto });
  }

  getMyRequests(gamadId: string) {
    return this.repo.findMyRequests(gamadId);
  }

  async getRequest(id: string, gamadId: string) {
    const req = await this.repo.findRequestById(id);
    if (!req) throw new NotFoundException('Demande introuvable');
    if (req.gamadId !== gamadId) throw new NotFoundException('Demande introuvable');
    return req;
  }

  async join(cellId: string, gamadId: string) {
    const existing = await this.repo.findMembership(cellId, gamadId);
    if (existing) throw new ConflictException('Vous êtes déjà membre de cette Zumara');
    return this.repo.createMembership(cellId, gamadId);
  }

  getMyCells(gamadId: string) {
    return this.repo.findMyCells(gamadId);
  }
}
