import { IsString, IsNotEmpty } from 'class-validator';

export class SetConfigDto {
  @IsString() @IsNotEmpty() value: string;
}
