export type PostSort = "latest" | "mostViewed";

export interface PostAuthor {
  id: string;
  username: string;
}

export interface PostItem {
  id: string;
  title?: string;
  content: string;
  createdAt?: string;
  author?: PostAuthor;
  likesCount?: number;
  viewsCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
}

export interface ConversationItem {
  id: string;
  title?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  participantsCount?: number;
}
