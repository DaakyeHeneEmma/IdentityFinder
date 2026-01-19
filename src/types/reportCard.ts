export interface ReportCardSubmission {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  idType: string;
  idDescription: string;
  fileDescription?: string;
  status: "lost" | "found" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportCardRequest {
  fullName: string;
  phone: string;
  email: string;
  idType: string;
  idDescription: string;
  fileDescription?: string;
}

export interface ReportCardResponse {
  success: boolean;
  data?: ReportCardSubmission;
  error?: string;
}
