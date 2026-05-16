import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class UpsertChannelDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @Matches(/^[a-z0-9-]+$/, { message: 'Le slug doit être en minuscules, chiffres et tirets uniquement' })
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;
}
