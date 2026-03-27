export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  participantInfo: ParticipantInfo[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParticipantInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ChatMatch {
  id: string;
  reportId: string;
  reportType: "lost" | "found";
  matchedUserId: string;
  matchedUserName: string;
  matchedUserEmail: string;
  idType: string;
  description: string;
  status: "pending" | "contacted" | "resolved";
  createdAt: Date;
}

export interface SendMessageRequest {
  receiverId: string;
  content: string;
}

export interface CreateConversationRequest {
  matchedUserId: string;
  matchedUserName: string;
  matchedUserEmail: string;
  reportId: string;
  reportType: "lost" | "found";
}
