export interface ICommentItem {
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

export interface ICommentsState {
	byPostId: Record<string, ICommentItem[]>;
	statusByPostId: Record<string, "idle" | "loading" | "succeeded" | "failed">;
	errorByPostId: Record<string, string | null>;
}
