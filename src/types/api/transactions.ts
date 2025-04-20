// src/types/api/transactions.ts
import { ApiResponse, PaginatedResponse } from "./responses";

export interface Transaction {
  TransactionID: number;
  UserID: number;
  Amount: number;
  TransactionType: "Deposit" | "Transfer" | "Withdrawal";
  Status: string;
  Description?: string | null;
  CreatedAt: string;
  UpdatedAt: string;
  ReceiverID?: number | null;
}

// GET /api/v1/transactions
export interface GetTransactionsQuery {
  page?: number;
  per_page?: number;
  transaction_type?: "Deposit" | "Transfer" | "Withdrawal";
  transaction_status?: string;
  user_id?: number;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  order?: "asc" | "desc";
}
export interface GetTransactionsResponse
  extends PaginatedResponse<Transaction> {
  success: boolean;
  message: string;
  status_code: number;
}

// GET /api/v1/transactions/{transaction_id}
export type GetTransactionByIdResponse = ApiResponse<Transaction>;

// GET /api/v1/transactions/export
export interface ExportTransactionsQuery {
  user_id?: number;
  start_date?: string;
  end_date?: string;
  transaction_status?: string;
  transaction_type?: "Deposit" | "Transfer" | "Withdrawal";
}
export interface ExportTransactionsResponse {
  headers: {
    "Content-Type": string;
    "Content-Disposition": string;
  };
  body: string; // CSV content
}
