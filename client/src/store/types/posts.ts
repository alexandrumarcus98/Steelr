export type IPostSort = "latest" | "mostViewed";

export interface IPostAuthor {
	id: string;
	username: string;
}

export interface IPostItem {
	id: string;
	title?: string;
	content: string;
	createdAt?: string;
	author?: IPostAuthor;
	likesCount?: number;
	viewsCount?: number;
	commentsCount?: number;
	isLiked?: boolean;
}

export interface IFetchPostsParams {
	sort: IPostSort;
	page: number;
	limit: number;
}

export interface IFetchPostsResult {
	items: IPostItem[];
	hasMore: boolean;
	page: number;
}

export interface IPostsState {
	items: IPostItem[];
	mostViewed: IPostItem[];
	lastVisited: IPostItem[];
	currentPost: IPostItem | null; // 👈 add this
	status: "idle" | "loading" | "succeeded" | "failed";
	mostViewedStatus: "idle" | "loading" | "succeeded" | "failed";
	lastVisitedStatus: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	mostViewedError: string | null;
	lastVisitedError: string | null;
	sort: IPostSort;
	page: number;
	limit: number;
	hasMore: boolean;
}
