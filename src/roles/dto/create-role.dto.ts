export interface RolePermissionDto {
  id: number;
  roleID: string;
  permissionID: string;
}

export class CreateRoleDto {
  name: string;
  description: string;
  type: string;
  roleID?: number;
  permissionsIds?: RolePermissionDto[];
}
