export class CreatePermissionDto {
  type: string; // 'feature' or 'controller'
  name?: string;
  category?: string;
  controller?: string;
  action?: string;
  route?: string;
  description?: string;
}