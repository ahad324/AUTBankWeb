export type Notification =
  | {
      type: "transaction";
      data: {
        TransactionID: number;
        Amount: number;
      };
    }
  | {
      type: "loan";
      data: {
        LoanID: number;
      };
    }
  | {
      type: "user";
      data: {
        Username: string;
      };
    }
  | {
      type: string;
      data: Record<string, any>; // fallback for unknown types
    };
