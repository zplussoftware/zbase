import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, DeleteDateColumn } from 'typeorm';

@Entity()
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column({ nullable: true })
  userName: string;

  @Column()
  @Index()
  action: string;

  @Column({ nullable: true })
  module: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  details: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ default: 'system' })
  createdBy: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}