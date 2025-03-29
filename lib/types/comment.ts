export interface CommentAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface CommentType {
  id: string;
  profileId: string;
  author: CommentAuthor;
  content: string;
  createdAt: Date;
  likes: number;
  dislikes: number;
  replies: CommentType[]; // recursive replies
}
