export type User = {
  UserID: number;
  Username: string;
  Email: string;
  CreatedAt: string;
};

export type Transaction = {
  TransactionID: number;
  UserID: number;
  Amount: number;
  Type: string;
  Description: string;
  CreatedAt: string;
};

export type Permission = {
  PermissionID: number;
  PermissionName: string;
  CreatedAt: string;
};

export type Theme = "dark" | "light";
