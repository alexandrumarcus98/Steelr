import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import type { PostItem, PostSort } from "@/store/types";

const POSTS_ENDPOINT = import.meta.env.VITE_POSTS_ENDPOINT || "/posts";

interface FetchPostsParams {
	sort: PostSort;
	page: number;
	limit: number;
}

interface FetchPostsResult {
	items: PostItem[];
	hasMore: boolean;
	page: number;
}

interface PostsState {
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

const initialState: PostsState = {
	items: [],
	mostViewed: [],
	lastVisited: [],
	currentPost: null,
	status: "idle",
	mostViewedStatus: "idle",
	lastVisitedStatus: "idle",
	error: null,
	mostViewedError: null,
	lastVisitedError: null,
	sort: "latest",
	page: 1,
	limit: 20,
	hasMore: true,
};

const normalizePost = (raw: Record<string, unknown>): PostItem => ({
	id: String(raw.id ?? raw._id ?? ""),
	title: typeof raw.title === "string" ? raw.title : undefined,
	content: typeof raw.content === "string" ? raw.content : "",
	createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
	author:
		typeof raw.author === "object" && raw.author !== null
			? {
				id: String((raw.author as Record<string, unknown>).id ?? ""),
				username:
					typeof (raw.author as Record<string, unknown>).username === "string"
						? String((raw.author as Record<string, unknown>).username)
						: "",
			}
			: undefined,
	likesCount: typeof raw.likesCount === "number" ? raw.likesCount : undefined,
	viewsCount: typeof raw.viewsCount === "number" ? raw.viewsCount : undefined,
	commentsCount:
		typeof raw.commentsCount === "number" ? raw.commentsCount : undefined,
	isLiked: typeof raw.isLiked === "boolean" ? raw.isLiked : undefined,
});

export const fetchPosts = createAsyncThunk<FetchPostsResult, FetchPostsParams>(
	"posts/fetchPosts",
	async ({ sort, page, limit }) => {
		const { data } = await api.get(POSTS_ENDPOINT, {
			params: {
				page,
				limit,
				sortBy: sort === "mostViewed" ? "viewsCount" : "createdAt",
				sortOrder: "desc",
			},
		});

		const rawItems = Array.isArray(data?.data)
			? data.data
			: Array.isArray(data?.items)
				? data.items
				: Array.isArray(data)
					? data
					: [];

		const normalizedItems = rawItems
			.filter((item: unknown) => typeof item === "object" && item !== null)
			.map((item: unknown) => normalizePost(item as Record<string, unknown>))
			.filter((post: PostItem) => post.id);

		const hasMore =
			typeof data?.meta?.hasMore === "boolean"
				? data.meta.hasMore
				: normalizedItems.length === limit;

		return {
			items: normalizedItems,
			hasMore,
			page,
		};
	},
);

export const fetchMostViewedPosts = createAsyncThunk<PostItem[], number>(
	"posts/fetchMostViewed",
	async (limit = 10) => {
		const { data } = await api.get(`${POSTS_ENDPOINT}/most-viewed`, {
			params: { limit },
		});

		const rawItems = Array.isArray(data?.data)
			? data.data
			: Array.isArray(data?.items)
				? data.items
				: Array.isArray(data)
					? data
					: [];

		const normalizedItems = rawItems
			.filter((item: unknown) => typeof item === "object" && item !== null)
			.map((item: unknown) => normalizePost(item as Record<string, unknown>))
			.filter((post: PostItem) => post.id);

		return normalizedItems;
	},
);

export const fetchLastVisitedPosts = createAsyncThunk<PostItem[], number>(
	"posts/fetchLastVisited",
	async (limit = 10) => {
		const { data } = await api.get(`${POSTS_ENDPOINT}/last-visited`, {
			params: { limit },
		});

		const rawItems = Array.isArray(data?.data)
			? data.data
			: Array.isArray(data?.items)
				? data.items
				: Array.isArray(data)
					? data
					: [];

		const normalizedItems = rawItems
			.filter((item: unknown) => typeof item === "object" && item !== null)
			.map((item: unknown) => normalizePost(item as Record<string, unknown>))
			.filter((post: PostItem) => post.id);

		return normalizedItems;
	},
);

export const likePost = createAsyncThunk<string, string>(
	"posts/likePost",
	async (postId) => {
		await api.post(`${POSTS_ENDPOINT}/${postId}/like`);
		return postId;
	},
);

export const unlikePost = createAsyncThunk<string, string>(
	"posts/unlikePost",
	async (postId) => {
		await api.post(`${POSTS_ENDPOINT}/${postId}/unlike`);
		return postId;
	},
);

export const fetchPostById = createAsyncThunk<PostItem, string>(
	"posts/fetchPostById",
	async (postId) => {
		const { data } = await api.get(`${POSTS_ENDPOINT}/${postId}`);

		const raw =
			(data && (data.data || data.item)) ??
			data; // flexible shape like in fetchPosts

		const post = normalizePost(raw as Record<string, unknown>);

		return post;
	}
);

const postsSlice = createSlice({
	name: "posts",
	initialState,
	reducers: {
		setSort(state, action: PayloadAction<PostSort>) {
			state.sort = action.payload;
			state.page = 1;
			state.hasMore = true;
			state.items = [];
			state.error = null;
		},
		resetPosts(state) {
			state.items = [];
			state.status = "idle";
			state.error = null;
			state.page = 1;
			state.hasMore = true;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchPosts.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchPosts.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.error = null;
				state.hasMore = action.payload.hasMore;
				state.page = action.payload.page;

				if (action.payload.page === 1) {
					state.items = action.payload.items;
					return;
				}

				const existingIds = new Set(state.items.map((item) => item.id));
				const freshItems = action.payload.items.filter(
					(item) => !existingIds.has(item.id),
				);
				state.items = [...state.items, ...freshItems];
			})
			.addCase(fetchPosts.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message ?? "Failed to load posts";
			})
			.addCase(fetchMostViewedPosts.pending, (state) => {
				state.mostViewedStatus = "loading";
				state.mostViewedError = null;
			})
			.addCase(fetchMostViewedPosts.fulfilled, (state, action) => {
				state.mostViewedStatus = "succeeded";
				state.mostViewedError = null;
				state.mostViewed = action.payload;
			})
			.addCase(fetchMostViewedPosts.rejected, (state, action) => {
				state.mostViewedStatus = "failed";
				state.mostViewedError = action.error.message ?? "Failed to load most viewed posts";
			})
			.addCase(fetchLastVisitedPosts.pending, (state) => {
				state.lastVisitedStatus = "loading";
				state.lastVisitedError = null;
			})
			.addCase(fetchLastVisitedPosts.fulfilled, (state, action) => {
				state.lastVisitedStatus = "succeeded";
				state.lastVisitedError = null;
				state.lastVisited = action.payload;
			})
			.addCase(fetchLastVisitedPosts.rejected, (state, action) => {
				state.lastVisitedStatus = "failed";
				state.lastVisitedError = action.error.message ?? "Failed to load last visited posts";
			})
			.addCase(likePost.fulfilled, (state, action) => {
				const id = action.payload;

				state.items = state.items.map((post) =>
					post.id !== id
						? post
						: {
							...post,
							isLiked: true,
							likesCount: (post.likesCount ?? 0) + 1,
						}
				);

				if (state.currentPost && state.currentPost.id === id) {
					state.currentPost = {
						...state.currentPost,
						isLiked: true,
						likesCount: (state.currentPost.likesCount ?? 0) + 1,
					};
				}
			})
			.addCase(unlikePost.fulfilled, (state, action) => {
				const id = action.payload;

				state.items = state.items.map((post) =>
					post.id !== id
						? post
						: {
							...post,
							isLiked: false,
							likesCount: Math.max((post.likesCount ?? 0) - 1, 0),
						}
				);

				if (state.currentPost && state.currentPost.id === id) {
					state.currentPost = {
						...state.currentPost,
						isLiked: false,
						likesCount: Math.max(
							(state.currentPost.likesCount ?? 0) - 1,
							0
						),
					};
				}
			})
			.addCase(fetchPostById.pending, (state) => {
				state.status = "loading";
				state.error = null;
				state.currentPost = null;
			})
			.addCase(fetchPostById.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.error = null;
				state.currentPost = action.payload;

				// also sync into items[] if it already exists there
				const idx = state.items.findIndex((p) => p.id === action.payload.id);
				if (idx !== -1) {
					state.items[idx] = action.payload;
				}
			})
			.addCase(fetchPostById.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message ?? "Failed to load post";
				state.currentPost = null;
			})
	},
});

export const { setSort, resetPosts } = postsSlice.actions;
export default postsSlice.reducer;
