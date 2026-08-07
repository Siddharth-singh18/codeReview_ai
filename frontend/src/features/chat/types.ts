export interface Message {
  id?: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt?: string;
}

export interface ChatSession {
  id: string;
  projectId: string;
  userId: string;
  createdAt: string;
  messages: Message[];
}
