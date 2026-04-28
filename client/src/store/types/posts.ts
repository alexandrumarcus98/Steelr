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

export interface FetchPostsParams {
	sort: PostSort;
	page: number;
	limit: number;
}

export interface FetchPostsResult {
	items: PostItem[];
	hasMore: boolean;
	page: number;
}

export interface PostsState {
	items: PostItem[];
	mostViewed: PostItem[];
	lastVisited: PostItem[];
	currentPost: PostItem | null;   // 👈 add this
	status: "idle" | "loading" | "succeeded" | "failed";
	mostViewedStatus: "idle" | "loading" | "succeeded" | "failed";
	lastVisitedStatus: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	mostViewedError: string | null;
	lastVisitedError: string | null;
	sort: PostSort;
	page: number;
	limit: number;
	hasMore: boolean;
}
