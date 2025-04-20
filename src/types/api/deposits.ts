// src/types/api/deposits.ts
import { ApiResponse, PaginatedResponse } from "./responses";

export interface Deposit {
  DepositID: number;
  UserID: number;
  AdminID: number;
  Amount: number;
  ReferenceNumber: string;
  Status: string;
  Description?: string | null;
  CreatedAt: string;
  UpdatedAt: string;
}

// GET /api/v1/users/{user_id}/deposits
export interface GetDepositsQuery {
  page?: number;
  per_page?: number;
  deposit_status?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  order?: "asc" | "desc";
}
export interface GetDepositsResponse extends PaginatedResponse<Deposit> {
  success: boolean;
  message: string;
  status_code: number;
}

// POST /api/v1/users/{user_id}/deposits
export interface CreateDepositRequest {
  Amount: number;
  Description?: string;
}
export type CreateDepositResponse = ApiResponse<Deposit>;
