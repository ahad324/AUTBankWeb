// src/types/api/admins.ts
import { ApiResponse, PaginatedResponse } from "./responses";

export interface Role {
  RoleID: number;
  RoleName: string;
  Description?: string | null;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface Permission {
  PermissionID: number;
  PermissionName: string;
  Description?: string | null;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface Admin {
  AdminID: number;
  Username: string;
  Email: string;
  RoleID: number;
  CreatedAt: string;
  UpdatedAt: string;
  LastLogin?: string | null;
  Role?: Role;
  Permissions?: Permission[];
}

// GET /api/v1/admins
export interface GetAdminsQuery {
  page?: number;
  per_page?: number;
  username?: string;
  email?: string;
  roleId?: number;
  sort_by?:
    | "AdminID"
    | "Username"
    | "Email"
    | "RoleID"
    | "CreatedAt"
    | "LastLogin";
  order?: "asc" | "desc";
}
export interface GetAdminsResponse extends PaginatedResponse<Admin> {
  success: boolean;
  message: string;
  status_code: number;
}

// GET /api/v1/admins/{admin_id}
export type GetAdminByIdResponse = ApiResponse<Admin>;

// POST /api/v1/admins/register
export interface RegisterAdminRequest {
  Username: string;
  Email: string;
  Password: string;
  RoleID: number;
}
export type RegisterAdminResponse = ApiResponse<Admin>;

// POST /api/v1/admins/login
export interface LoginAdminRequest {
  Email: string;
  Password: string;
}
export type LoginAdminResponse = ApiResponse<{
  AdminID: number;
  Username: string;
  Email: string;
  Role: Role;
  Permissions: Permission[];
  LastLogin?: string | null;
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}>;

// PUT /api/v1/admins/me
export interface UpdateAdminRequest {
  Username?: string;
  Email?: string;
}
export type UpdateAdminResponse = ApiResponse<Admin>;

// PUT /api/v1/admins/{admin_id}
export interface UpdateOtherAdminRequest {
  Username?: string;
  Email?: string;
  RoleID?: number;
}
export type UpdateOtherAdminResponse = ApiResponse<Admin>;

// PUT /api/v1/admins/me/password
export interface UpdateAdminPasswordRequest {
  CurrentPassword: string;
  NewPassword: string;
}
export type UpdateAdminPasswordResponse = ApiResponse<{
  AdminID: number;
}>;

// DELETE /api/v1/admins/{admin_id}
export type DeleteAdminResponse = ApiResponse<{
  AdminID: number;
}>;

// GET /api/v1/admins/me
export type GetAdminMeResponse = ApiResponse<{
  AdminID: number;
  Username: string;
  Email: string;
  Role: Role;
  Permissions: Permission[];
  LastLogin?: string | null;
}>;

// POST /api/v1/admins/refresh
export interface RefreshTokenRequest {
  token: string;
}
export type RefreshTokenResponse = ApiResponse<{
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}>;

// GET /api/v1/analytics/summary
export type AnalyticsSummaryResponse = ApiResponse<{
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  transactions: {
    total_volume: number;
    deposits: number;
    transfers: number;
    withdrawals: number;
  };
  loans: {
    total_approved_amount: number;
    total_approved_count: number;
    pending_count: number;
    pending_amount: number;
    repaid_count: number;
  };
  average_user_balance: number;
  rbac: {
    total_roles: number;
    total_permissions: number;
    roles_with_permissions: number;
  };
}>;
