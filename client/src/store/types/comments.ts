export interface CommentItem {
	id: string;
	postId: string;
	content: string;
	createdAt?: string;
	updatedAt?: string;
	isEdited?: boolean;
	author?: {
		id: string;
		username: string;
	};
}

export interface CommentsState {
	byPostId: Record<string, CommentItem[]>;
	statusByPostId: Record<string, "idle" | "loading" | "succeeded" | "failed">;
	errorByPostId: Record<string, string | null>;
}
