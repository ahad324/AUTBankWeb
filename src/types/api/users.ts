// src/types/api/users.ts
import { ApiResponse, PaginatedResponse } from "./responses";

export interface User {
  UserID: number;
  Username: string;
  FirstName: string;
  LastName: string;
  StreetAddress?: string | null;
  City?: string | null;
  State?: string | null;
  Country?: string | null;
  PostalCode?: string | null;
  PhoneNumber?: string | null;
  CNIC: string;
  Email: string;
  AccountType: "Savings" | "Current";
  Balance: number;
  IsActive: boolean;
  DateOfBirth: string;
  CreatedAt: string;
  UpdatedAt: string;
  LastLogin?: string | null;
}

// GET /api/v1/users
export interface GetUsersQuery {
  page?: number;
  per_page?: number;
  username?: string;
  email?: string;
  isactive?: boolean;
  account_type?: "Savings" | "Current" | string;
  balance_min?: number;
  balance_max?: number;
  sort_by?:
    | "UserID"
    | "Username"
    | "Email"
    | "Balance"
    | "CreatedAt"
    | "LastLogin";
  order?: "asc" | "desc";
}
export interface GetUsersResponse extends PaginatedResponse<User> {
  success: boolean;
  message: string;
  status_code: number;
}

// GET /api/v1/users/{user_id}
export type GetUserResponse = ApiResponse<User>;

// PUT /api/v1/users/{user_id}
export interface UpdateUserRequest {
  Username?: string;
  FirstName?: string;
  LastName?: string;
  StreetAddress?: string | null;
  City?: string | null;
  State?: string | null;
  Country?: string | null;
  PostalCode?: string | null;
  PhoneNumber?: string | null;
  Email?: string;
  IsActive?: boolean;
}
export type UpdateUserResponse = ApiResponse<User>;

// DELETE /api/v1/users/{user_id}
export type DeleteUserResponse = ApiResponse<{
  UserID: number;
}>;

// PUT /api/v1/users/toggle_user_status/{user_id}
export type ToggleUserStatusResponse = ApiResponse<{
  UserID: number;
  IsActive: boolean;
  ApprovedByAdminID?: number | null;
}>;
