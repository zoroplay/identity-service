export class CreatePermissionDto {
  name: string;
  description: string;
  permissionID: number;
}
export class AssignPermissionDto {
  roleID: number;
  permissions: number[];
}
export const PERMISSION_SERVICE = 'PermissionService';
