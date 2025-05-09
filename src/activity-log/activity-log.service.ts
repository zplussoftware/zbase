import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../entities/activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async create(createActivityLogDto: CreateActivityLogDto): Promise<ActivityLog> {
    const activityLog = this.activityLogRepository.create(createActivityLogDto);
    return this.activityLogRepository.save(activityLog);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: ActivityLog[]; total: number }> {
    const [data, total] = await this.activityLogRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findByUserId(
    userId: number, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{ data: ActivityLog[]; total: number }> {
    const [data, total] = await this.activityLogRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findByAction(
    action: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: ActivityLog[]; total: number }> {
    const [data, total] = await this.activityLogRepository.findAndCount({
      where: { action },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findRecent(limit: number = 10): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async remove(id: number): Promise<void> {
    const log = await this.activityLogRepository.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException(`Activity log with ID ${id} not found`);
    }
    
    await this.activityLogRepository.softDelete(id);
  }

  async restore(id: number): Promise<void> {
    await this.activityLogRepository.restore(id);
  }
}