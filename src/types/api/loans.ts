// src/types/api/loans.ts
import { ApiResponse, PaginatedResponse } from "./responses";

export interface Loan {
  LoanID: number;
  UserID: number;
  LoanTypeName: string;
  LoanAmount: number;
  InterestRate: number;
  LoanDurationMonths: number;
  MonthlyInstallment: number;
  DueDate: string;
  LoanStatus: "Pending" | "Approved" | "Rejected" | "Repaid";
  CreatedAt: string;
  UpdatedAt: string;
  ApprovedAt?: string | null;
  RejectedAt?: string | null;
}

// GET /api/v1/loans
export interface GetLoansQuery {
  page?: number;
  per_page?: number;
  loan_status?: "Pending" | "Approved" | "Rejected" | "Repaid";
  user_id?: number;
  loan_type_id?: number;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  order?: "asc" | "desc";
}
export interface GetLoansResponse extends PaginatedResponse<Loan> {
  success: boolean;
  message: string;
  status_code: number;
}

// PUT /api/v1/loans/{loan_id}/approve
export type ApproveLoanResponse = ApiResponse<{
  LoanID: number;
  LoanStatus: string;
}>;

// PUT /api/v1/loans/{loan_id}/reject
export type RejectLoanResponse = ApiResponse<{
  LoanID: number;
  LoanStatus: string;
}>;
