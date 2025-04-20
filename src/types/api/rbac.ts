// src/types/api/rbac.ts
import { Role, Permission } from "./admins";
import { ApiResponse, PaginatedResponse } from "./responses";

// GET /api/v1/rbac/roles
export interface GetRolesQuery {
  page?: number;
  per_page?: number;
}
export interface GetRolesResponse extends PaginatedResponse<Role> {
  success: boolean;
  message: string;
  status_code: number;
}

// POST /api/v1/rbac/roles
export interface CreateRoleRequest {
  RoleName: string;
  Description?: string;
}
export type CreateRoleResponse = ApiResponse<{
  created_roles: Role[];
  skipped_roles: string[];
}>;

// PUT /api/v1/rbac/roles/{role_id}
export interface UpdateRoleRequest {
  RoleName?: string;
  Description?: string;
}
export type UpdateRoleResponse = ApiResponse<Role>;

// DELETE /api/v1/rbac/roles/{role_id}
export type DeleteRoleResponse = ApiResponse<{
  RoleID: number;
}>;

// GET /api/v1/rbac/permissions
export interface GetPermissionsQuery {
  page?: number;
  per_page?: number;
}
export interface GetPermissionsResponse extends PaginatedResponse<Permission> {
  success: boolean;
  message: string;
  status_code: number;
}

// POST /api/v1/rbac/permissions
export interface CreatePermissionRequest {
  PermissionName: string;
  Description?: string;
}
export type CreatePermissionResponse = ApiResponse<{
  created_permissions: Permission[];
  skipped_permissions: string[];
}>;

// PUT /api/v1/rbac/permissions/{permission_id}
export interface UpdatePermissionRequest {
  PermissionName?: string;
  Description?: string;
}
export type UpdatePermissionResponse = ApiResponse<Permission>;

// DELETE /api/v1/rbac/permissions/{permission_id}
export type DeletePermissionResponse = ApiResponse<{
  PermissionID: number;
}>;

// POST /api/v1/rbac/role_permissions
export interface AssignPermissionRequest {
  RoleID: number;
  PermissionID: number | number[];
}
export type AssignPermissionResponse = ApiResponse<{
  RoleID: number;
  AssignedPermissionIDs: number[];
  SkippedPermissionIDs: number[];
}>;

// DELETE /api/v1/rbac/role_permissions
export interface RevokePermissionRequest {
  RoleID: number;
  PermissionID: number | number[];
}
export type RevokePermissionResponse = ApiResponse<{
  RoleID: number;
  RemovedPermissionIDs: number[];
  SkippedPermissionIDs: number[];
}>;

// GET /api/v1/rbac/roles/{role_id}/permissions
export type GetRolePermissionsResponse = ApiResponse<{
  RoleID: number;
  RoleName: string;
  permissions: Permission[];
}>;
