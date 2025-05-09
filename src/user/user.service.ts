import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    // This will automatically exclude soft-deleted records
    return this.userRepository.find();
  }

  // Method to find all users including soft-deleted ones
  async findAllWithDeleted(): Promise<User[]> {
    return this.userRepository.find({ withDeleted: true });
  }

  // Method to specifically find only soft-deleted users
  async findDeleted(): Promise<User[]> {
    return this.userRepository.find({ 
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) }
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // Using soft delete instead of hard delete
    await this.userRepository.softDelete(id);
  }

  // Method to restore a soft-deleted user
  async restore(id: number): Promise<void> {
    await this.userRepository.restore(id);
  }

  // New methods for admin statistics
  async count(): Promise<number> {
    return this.userRepository.count();
  }

  async countActive(): Promise<number> {
    // Assuming your User entity has an 'active' field
    // Modify this query based on your actual data model
    return this.userRepository.count({
      where: { active: true }
    });
  }

  async findRecent(limit: number = 10): Promise<User[]> {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      select: ['id', 'name', 'email', 'createdAt', 'roles', 'active'] // Exclude sensitive fields like password
    });
  }
}