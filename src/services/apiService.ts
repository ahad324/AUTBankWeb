// src/services/apiService.ts
import api from "@/lib/api";
import {
  GetAdminsResponse,
  RegisterAdminRequest,
  UpdateAdminRequest,
  DeleteAdminResponse,
  GetAdminMeResponse,
  AnalyticsSummaryResponse,
  GetUsersResponse,
  UpdateUserRequest,
  DeleteUserResponse,
  GetDepositsResponse,
  CreateDepositRequest,
  GetLoansResponse,
  ApproveLoanResponse,
  RejectLoanResponse,
  GetCardsResponse,
  BlockCardRequest,
  BlockCardResponse,
  UnblockCardResponse,
  GetTransactionsResponse,
  GetRolesResponse,
  CreateRoleRequest,
  CreateRoleResponse,
  UpdateRoleRequest,
  DeleteRoleResponse,
  GetPermissionsResponse,
  CreatePermissionRequest,
  CreatePermissionResponse,
  UpdatePermissionRequest,
  DeletePermissionResponse,
  AssignPermissionRequest,
  AssignPermissionResponse,
  RevokePermissionRequest,
  RevokePermissionResponse,
  GetRolePermissionsResponse,
  UpdateAdminPasswordRequest,
  UpdateAdminPasswordResponse,
  LoginAdminRequest,
  LoginAdminResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  GetAdminByIdResponse,
  ToggleUserStatusResponse,
  GetTransactionByIdResponse,
  ExportTransactionsResponse,
  GetCardByIdResponse,
  UpdateCardRequest,
  UpdateCardResponse,
  Admin,
  User,
  Deposit,
  Role,
  Permission,
  Transaction,
  Card,
  ApiResponse,
  UpdateOtherAdminRequest,
  UpdateOtherAdminResponse,
} from "@/types/api";
import { AxiosResponse } from "axios";

interface ApiParams {
  page?: number;
  per_page?: number;
  [key: string]: string | number | undefined;
}

// Generic API response handler
const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
  return response.data.data;
};

export const apiService = {
  // Authentication
  loginAdmin: async (
    data: LoginAdminRequest
  ): Promise<LoginAdminResponse["data"]> =>
    handleResponse(await api.post<LoginAdminResponse>("/admins/login", data)),

  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<RefreshTokenResponse["data"]> =>
    handleResponse(
      await api.post<RefreshTokenResponse>("/admins/refresh", data)
    ),

  // Profile
  updateAdminPassword: async (
    data: UpdateAdminPasswordRequest
  ): Promise<UpdateAdminPasswordResponse["data"]> =>
    handleResponse(
      await api.put<UpdateAdminPasswordResponse>("/admins/me/password", data)
    ),

  // Admins
  getAdmins: async (params?: ApiParams): Promise<GetAdminsResponse["data"]> =>
    handleResponse(
      await api.get<GetAdminsResponse>("/admins/admins", { params })
    ),

  getAdminById: async (admin_id: number): Promise<Admin> =>
    handleResponse(
      await api.get<GetAdminByIdResponse>(`/admins/admins/${admin_id}`)
    ),

  registerAdmin: async (data: RegisterAdminRequest): Promise<Admin> =>
    handleResponse(
      await api.post<ApiResponse<Admin>>("/admins/register", data)
    ),

  updateAdmin: async (data: UpdateAdminRequest): Promise<Admin> =>
    handleResponse(await api.put<ApiResponse<Admin>>("/admins/me", data)),

  updateOtherAdmin: async (
    admin_id: number,
    data: UpdateOtherAdminRequest
  ): Promise<Admin> =>
    handleResponse(
      await api.put<UpdateOtherAdminResponse>(
        `/admins/admins/${admin_id}`,
        data
      )
    ),

  deleteAdmin: async (admin_id: number): Promise<DeleteAdminResponse["data"]> =>
    handleResponse(
      await api.delete<DeleteAdminResponse>(`/admins/admins/${admin_id}`)
    ),

  getAdminMe: async (): Promise<GetAdminMeResponse["data"]> =>
    handleResponse(await api.get<GetAdminMeResponse>("/admins/me")),

  getAnalyticsSummary: async (): Promise<AnalyticsSummaryResponse["data"]> =>
    handleResponse(
      await api.get<AnalyticsSummaryResponse>("/admins/analytics/summary")
    ),

  // Users
  getUsers: async (params?: ApiParams): Promise<GetUsersResponse["data"]> =>
    handleResponse(
      await api.get<GetUsersResponse>("/admins/users", { params })
    ),

  getUser: async (user_id: number): Promise<User> =>
    handleResponse(
      await api.get<ApiResponse<User>>(`/admins/users/${user_id}`)
    ),

  updateUser: async (user_id: number, data: UpdateUserRequest): Promise<User> =>
    handleResponse(
      await api.put<ApiResponse<User>>(`/admins/users/${user_id}`, data)
    ),

  deleteUser: async (user_id: number): Promise<DeleteUserResponse["data"]> =>
    handleResponse(
      await api.delete<DeleteUserResponse>(`/admins/users/${user_id}`)
    ),

  toggleUserStatus: async (
    user_id: number
  ): Promise<ToggleUserStatusResponse["data"]> =>
    handleResponse(
      await api.put<ToggleUserStatusResponse>(
        `/admins/users/toggle_user_status/${user_id}`
      )
    ),

  // Deposits
  getDeposits: async (
    user_id: number,
    params?: ApiParams
  ): Promise<GetDepositsResponse["data"]> =>
    handleResponse(
      await api.get<GetDepositsResponse>(`/admins/users/${user_id}/deposits`, {
        params,
      })
    ),

  createDeposit: async (
    user_id: number,
    data: CreateDepositRequest
  ): Promise<Deposit> =>
    handleResponse(
      await api.post<ApiResponse<Deposit>>(
        `/admins/users/${user_id}/deposits`,
        data
      )
    ),

  // Loans
  getLoans: async (params?: ApiParams): Promise<GetLoansResponse["data"]> =>
    handleResponse(
      await api.get<GetLoansResponse>("/admins/loans", { params })
    ),

  approveLoan: async (loan_id: number): Promise<ApproveLoanResponse["data"]> =>
    handleResponse(
      await api.put<ApproveLoanResponse>(`/admins/loans/${loan_id}/approve`)
    ),

  rejectLoan: async (loan_id: number): Promise<RejectLoanResponse["data"]> =>
    handleResponse(
      await api.put<RejectLoanResponse>(`/admins/loans/${loan_id}/reject`)
    ),

  // Cards
  getCards: async (params?: ApiParams): Promise<GetCardsResponse["data"]> =>
    handleResponse(
      await api.get<GetCardsResponse>("/admins/cards", { params })
    ),

  getCardById: async (card_id: number): Promise<Card> =>
    handleResponse(
      await api.get<GetCardByIdResponse>(`/admins/cards/${card_id}`)
    ),

  blockCard: async (
    card_id: number,
    data?: BlockCardRequest
  ): Promise<BlockCardResponse["data"]> =>
    handleResponse(
      await api.put<BlockCardResponse>(`/admins/cards/${card_id}/block`, data)
    ),

  unblockCard: async (
    card_id: number,
    data?: BlockCardRequest
  ): Promise<UnblockCardResponse["data"]> =>
    handleResponse(
      await api.put<UnblockCardResponse>(
        `/admins/cards/${card_id}/unblock`,
        data
      )
    ),

  updateCard: async (card_id: number, data: UpdateCardRequest): Promise<Card> =>
    handleResponse(
      await api.put<UpdateCardResponse>(`/admins/cards/${card_id}`, data)
    ),

  // Transactions
  getTransactions: async (
    params?: ApiParams
  ): Promise<GetTransactionsResponse["data"]> =>
    handleResponse(
      await api.get<GetTransactionsResponse>("/admins/transactions", { params })
    ),

  getTransactionById: async (transaction_id: number): Promise<Transaction> =>
    handleResponse(
      await api.get<GetTransactionByIdResponse>(
        `/admins/transactions/details/${transaction_id}`
      )
    ),

  exportTransactions: async (params?: ApiParams): Promise<string> => {
    const response = await api.get<ExportTransactionsResponse>(
      "/admins/transactions/export",
      { params }
    );
    return response.data.body;
  },

  // RBAC
  getRoles: async (params?: ApiParams): Promise<GetRolesResponse["data"]> =>
    handleResponse(await api.get<GetRolesResponse>("/rbac/roles", { params })),

  createRole: async (
    data: CreateRoleRequest
  ): Promise<CreateRoleResponse["data"]> =>
    handleResponse(await api.post<CreateRoleResponse>("/rbac/roles", data)),

  updateRole: async (role_id: number, data: UpdateRoleRequest): Promise<Role> =>
    handleResponse(
      await api.put<ApiResponse<Role>>(`/rbac/roles/${role_id}`, data)
    ),

  deleteRole: async (role_id: number): Promise<DeleteRoleResponse["data"]> =>
    handleResponse(
      await api.delete<DeleteRoleResponse>(`/rbac/roles/${role_id}`)
    ),

  getPermissions: async (
    params?: ApiParams
  ): Promise<GetPermissionsResponse["data"]> =>
    handleResponse(
      await api.get<GetPermissionsResponse>("/rbac/permissions", { params })
    ),

  createPermission: async (
    data: CreatePermissionRequest
  ): Promise<CreatePermissionResponse["data"]> =>
    handleResponse(
      await api.post<CreatePermissionResponse>("/rbac/permissions", data)
    ),

  updatePermission: async (
    permission_id: number,
    data: UpdatePermissionRequest
  ): Promise<Permission> =>
    handleResponse(
      await api.put<ApiResponse<Permission>>(
        `/rbac/permissions/${permission_id}`,
        data
      )
    ),

  deletePermission: async (
    permission_id: number
  ): Promise<DeletePermissionResponse["data"]> =>
    handleResponse(
      await api.delete<DeletePermissionResponse>(
        `/rbac/permissions/${permission_id}`
      )
    ),

  getRolePermissions: async (
    role_id: number
  ): Promise<GetRolePermissionsResponse["data"]> =>
    handleResponse(
      await api.get<GetRolePermissionsResponse>(
        `/rbac/roles/${role_id}/permissions`
      )
    ),

  assignPermission: async (
    data: AssignPermissionRequest
  ): Promise<AssignPermissionResponse["data"]> =>
    handleResponse(
      await api.post<AssignPermissionResponse>("/rbac/role_permissions", data)
    ),

  revokePermission: async (
    data: RevokePermissionRequest
  ): Promise<RevokePermissionResponse["data"]> =>
    handleResponse(
      await api.delete<RevokePermissionResponse>("/rbac/role_permissions", {
        data,
      })
    ),
};
