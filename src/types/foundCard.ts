export interface FoundCardSubmission {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  idType: string;
  idDescription: string;
  fileDescription?: string;
  status: "found" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFoundCardRequest {
  fullName: string;
  phone: string;
  email: string;
  idType: string;
  idDescription: string;
  fileDescription?: string;
}

export interface FoundCardResponse {
  success: boolean;
  data?: FoundCardSubmission;
  error?: string;
}
