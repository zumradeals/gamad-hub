import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PortalZumaraRepository } from './portal-zumara.repository';
import { CreateZumaraRequestDto } from './dto/create-zumara-request.dto';
import { ZumaraType } from '@prisma/client';

@Injectable()
export class PortalZumaraService {
  constructor(private readonly repo: PortalZumaraRepository) {}

  listPublic(type?: ZumaraType, country?: string, city?: string) {
    return this.repo.findPublicCells({ type, country, city });
  }

  async getBySlug(slug: string, gamadId?: string) {
    const cell = await this.repo.findCellBySlug(slug);
    if (!cell) throw new NotFoundException('Zumara introuvable');
    let isMember = false;
    if (gamadId) {
      const m = await this.repo.findMembership(cell.id, gamadId);
      isMember = !!m;
    }
    return { ...cell, isMember };
  }

  async getMembers(cellId: string, page: number) {
    const take = 24;
    const skip = (page - 1) * take;
    const [members, total] = await Promise.all([
      this.repo.findMembers(cellId, skip, take),
      this.repo.countMembers(cellId),
    ]);
    return { members, total, page, pages: Math.ceil(total / take) };
  }

  getSuggestions(country: string) {
    return this.repo.findSuggestions(country ?? '');
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

  async leave(cellId: string, gamadId: string) {
    const m = await this.repo.findMembership(cellId, gamadId);
    if (!m) throw new NotFoundException('Vous n\'êtes pas membre de cette Zumara');
    if (m.role === 'FOUNDER') throw new ForbiddenException('Le fondateur ne peut pas quitter le groupe');
    return this.repo.deleteMembership(cellId, gamadId);
  }

  getMyCells(gamadId: string) {
    return this.repo.findMyCells(gamadId);
  }
}
