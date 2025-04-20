// src/types/api/cards.ts
import { ApiResponse, PaginatedResponse } from "./responses";

export interface Card {
  CardID: number;
  UserID: number;
  CardNumber: string;
  Status: "Active" | "Inactive" | "Blocked";
  ExpirationDate: string;
  CreatedAt: string;
  UpdatedAt: string;
}

// GET /api/v1/cards
export interface GetCardsQuery {
  page?: number;
  per_page?: number;
  user_id?: number;
}
export interface GetCardsResponse extends PaginatedResponse<Card> {
  success: boolean;
  message: string;
  status_code: number;
}

// GET /api/v1/cards/{card_id}
export type GetCardByIdResponse = ApiResponse<Card>;

// PUT /api/v1/cards/{card_id}/block
export interface BlockCardRequest {
  reason?: string;
}
export type BlockCardResponse = ApiResponse<{
  CardID: number;
}>;

// PUT /api/v1/cards/{card_id}/unblock
export interface UnblockCardRequest {
  reason?: string;
}
export type UnblockCardResponse = ApiResponse<{
  CardID: number;
}>;

// PUT /api/v1/cards/{card_id}
export interface UpdateCardRequest {
  Pin?: string;
  Status?: "Active" | "Inactive" | "Blocked";
}
export type UpdateCardResponse = ApiResponse<Card>;
