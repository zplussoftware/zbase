const fs = require('fs');
const path = require('path');

// Read the original file
const filePath = path.resolve('./src/admin/admin.service.ts');
const adminModulePath = path.resolve('./src/admin/admin.module.ts');

// Update admin.module.ts
let adminModuleContent = fs.readFileSync(adminModulePath, 'utf8');
if (!adminModuleContent.includes('RoleModule')) {
  adminModuleContent = adminModuleContent.replace(
    "import { Module } from '@nestjs/common';",
    "import { Module } from '@nestjs/common';\nimport { RoleModule } from '../role/role.module';\nimport { PermissionModule } from '../permission/permission.module';"
  );
  
  adminModuleContent = adminModuleContent.replace(
    "imports: [UserModule, ActivityLogModule],",
    "imports: [UserModule, ActivityLogModule, RoleModule, PermissionModule],"
  );
  
  fs.writeFileSync(adminModulePath, adminModuleContent);
  console.log('Updated admin.module.ts');
}

// Update admin.service.ts
let content = fs.readFileSync(filePath, 'utf8');

// Update imports
if (!content.includes('import { RoleService }')) {
  content = content.replace(
    "import { ActivityLogService } from '../activity-log/activity-log.service';",
    "import { ActivityLogService } from '../activity-log/activity-log.service';\nimport { RoleService } from '../role/role.service';\nimport { PermissionService } from '../permission/permission.service';"
  );
}

// Update constructor
if (!content.includes('private readonly roleService: RoleService')) {
  content = content.replace(
    "constructor(\n    private readonly userService: UserService,\n    private readonly activityLogService: ActivityLogService\n  ) {}",
    "constructor(\n    private readonly userService: UserService,\n    private readonly activityLogService: ActivityLogService,\n    private readonly roleService: RoleService,\n    private readonly permissionService: PermissionService\n  ) {}"
  );
}

// Update the getStats method to use actual counts
content = content.replace(
  "    // Count roles and permissions (mock data until we add these services)\n    const totalRoles = 5; // Placeholder value\n    const totalPermissions = 25; // Placeholder value",
  "    // Get actual role and permission counts\n    const roles = await this.roleService.findAll();\n    const totalRoles = roles.length;\n    \n    const permissions = await this.permissionService.findAll();\n    const totalPermissions = permissions.length;"
);

fs.writeFileSync(filePath, content);
console.log('Updated admin.service.ts');
