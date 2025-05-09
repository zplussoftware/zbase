import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  async findOne(id: number): Promise<Role> {
    // Find the role without trying to load the users relation
    const role = await this.rolesRepository.findOne({ 
      where: { id }
      // No longer loading relations: ['users']
    });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    // Make sure permissions is initialized even if it's null in the database
    if (!role.permissions) {
      role.permissions = [];
    }
    
    return role;
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    
    this.rolesRepository.merge(role, updateRoleDto);
    return this.rolesRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    // First check if the role exists
    const role = await this.rolesRepository.findOne({ where: { id } });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    // Use softDelete instead of delete for soft deletion
    await this.rolesRepository.softDelete({ id });
  }

  // Method to restore a soft-deleted role
  async restore(id: number): Promise<void> {
    await this.rolesRepository.restore(id);
  }

  async getPermissions(id: number): Promise<{ featurePermissions: string[], controllerPermissions: string[] }> {
    const role = await this.findOne(id);
    
    // Separate permissions into feature and controller permissions
    const permissions = role.permissions || [];
    const featurePermissions = permissions.filter(p => !p.includes('-'));
    const controllerPermissions = permissions.filter(p => p.includes('-'));
    
    return { featurePermissions, controllerPermissions };
  }

  async updatePermissions(id: number, updatePermissionsDto: UpdateRolePermissionsDto): Promise<Role> {
    const role = await this.findOne(id);
    
    // Combine feature and controller permissions
    const allPermissions = [
      ...updatePermissionsDto.featurePermissions,
      ...updatePermissionsDto.controllerPermissions
    ];
    
    role.permissions = allPermissions;
    return this.rolesRepository.save(role);
  }
}