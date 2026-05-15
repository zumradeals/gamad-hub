import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { PortalProfilesRepository } from './portal-profiles.repository';

@Controller('portal/profiles')
export class PortalProfilesController {
  constructor(private readonly repo: PortalProfilesRepository) {}

  @Get()
  directory(
    @Query('country') country?: string,
    @Query('trustLevel') trustLevel?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.repo.findDirectory({
      country,
      trustLevel,
      skip: parseInt(skip ?? '0', 10),
      take: Math.min(parseInt(take ?? '20', 10), 50),
    });
  }

  @Get(':publicCode')
  async getProfile(@Param('publicCode') publicCode: string) {
    const profile = await this.repo.findPublicProfile(publicCode);
    if (!profile) throw new NotFoundException('Profil introuvable');
    return profile;
  }
}
