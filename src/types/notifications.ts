export type Notification =
  | { type: "transaction"; data: { TransactionID: number; Amount: number } }
  | { type: "loan"; data: { LoanID: number } }
  | { type: "user"; data: { Username: string } };
