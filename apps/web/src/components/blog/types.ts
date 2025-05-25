export interface Comment {
  id: string;
  authorName: string;
  authorWebsite?: string;
  content: string;
  createdAt: string;
  replies: Comment[];
}

export interface CommentFormData {
  authorName: string;
  authorEmail: string;
  authorWebsite: string;
  content: string;
} 