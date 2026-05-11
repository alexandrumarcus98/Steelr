import { createSlice } from "@reduxjs/toolkit";

import {
	createComment,
	deleteComment,
	fetchCommentsForPost,
	updateComment,
} from "@/store/api/commentsApi";
import type { CommentsState } from "@/store/types/comments";

const initialState: CommentsState = {
	byPostId: {},
	statusByPostId: {},
	errorByPostId: {},
};

const commentsSlice = createSlice({
	name: "comments",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			// fetch
			.addCase(fetchCommentsForPost.pending, (state, action) => {
				const postId = action.meta.arg;
				state.statusByPostId[postId] = "loading";
				state.errorByPostId[postId] = null;
			})
			.addCase(fetchCommentsForPost.fulfilled, (state, action) => {
				const { postId, comments } = action.payload;
				state.statusByPostId[postId] = "succeeded";
				state.errorByPostId[postId] = null;
				state.byPostId[postId] = comments;
			})
			.addCase(fetchCommentsForPost.rejected, (state, action) => {
				const postId = action.meta.arg;
				state.statusByPostId[postId] = "failed";
				state.errorByPostId[postId] = action.error.message ?? "Failed to load comments";
			})
			// create
			.addCase(createComment.fulfilled, (state, action) => {
				const { postId, comment } = action.payload;
				const list = state.byPostId[postId] ?? [];
				state.byPostId[postId] = [...list, comment];
			})
			// update
			.addCase(updateComment.fulfilled, (state, action) => {
				const { postId, comment } = action.payload;
				state.byPostId[postId] = (state.byPostId[postId] ?? []).map((c) =>
					c.id === comment.id ? comment : c,
				);
			})
			// delete
			.addCase(deleteComment.fulfilled, (state, action) => {
				const { postId, commentId } = action.payload;
				state.byPostId[postId] = (state.byPostId[postId] ?? []).filter((c) => c.id !== commentId);
			});
	},
});

export default commentsSlice.reducer;
