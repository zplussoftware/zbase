import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateActivityLogDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsString()
  action: string;

  @IsString()
  @IsOptional()
  module?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  details?: Record<string, any>;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}