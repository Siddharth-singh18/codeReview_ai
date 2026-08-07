export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  _count?: {
    files: number;
    reviews: number;
    chatSessions: number;
  };
}
