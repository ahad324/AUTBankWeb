// src/types/api/responses.ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status_code: number;
}

export interface ApiError {
  status: string;
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
  status_code: number;
}
