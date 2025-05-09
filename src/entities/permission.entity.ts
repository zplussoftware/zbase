import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // 'feature' or 'controller'

  // For feature permissions
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  category: string;

  // For controller permissions
  @Column({ nullable: true })
  controller: string;

  @Column({ nullable: true })
  action: string;

  @Column({ nullable: true })
  route: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}