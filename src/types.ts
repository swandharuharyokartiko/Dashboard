export interface ApplicationData {
  no: number;
  dateIn: string;
  customerName: string;
  salesman: string;
  unit: string;
  category: "PASSANGER" | "COMMERCIAL";
  tdp: string;
  tenor: number;
  status: string;
  approvalDate?: string;
  remarks: string;
}

export interface DashboardStats {
  total: number;
  approved: number;
  rejected: number;
  canceled: number;
  pending: number;
}
