import type { PayloadAction } from "@reduxjs/toolkit";
import { createSelector, createSlice } from "@reduxjs/toolkit";

import {
	fetchLastVisitedPosts,
	fetchMostViewedPosts,
	fetchPostById,
	fetchPosts,
	likePost,
	unlikePost,
} from "@/store/api/postsApi";
import type { IPostItem, IPostSort, IPostsState } from "@/store/types/posts";

export const selectPosts = createSelector(
	[(state: { posts: IPostsState }) => state.posts.items],
	(items) => items,
);

export const initialState: IPostsState = {
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
	limit: 5,
	hasMore: true,
};

const postsSlice = createSlice({
	name: "posts",
	initialState,
	reducers: {
		setSort(state, action: PayloadAction<IPostSort>) {
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
					(item: IPostItem) => !existingIds.has(item.id),
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
							},
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
							},
				);

				if (state.currentPost && state.currentPost.id === id) {
					state.currentPost = {
						...state.currentPost,
						isLiked: false,
						likesCount: Math.max((state.currentPost.likesCount ?? 0) - 1, 0),
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
			});
	},
});

export const { setSort, resetPosts } = postsSlice.actions;
export default postsSlice.reducer;
