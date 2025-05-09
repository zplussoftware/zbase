import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from '../user/user.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { RoleModule } from '../role/role.module';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [UserModule, ActivityLogModule, RoleModule, PermissionModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}