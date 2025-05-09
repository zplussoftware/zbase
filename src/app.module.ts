import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ViewModule } from './view/view.module';
import { AdminModule } from './admin/admin.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    ViewModule,
    AdminModule,
    RoleModule,
    PermissionModule,
    ActivityLogModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', 'public'),
      serveRoot: '/static',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
