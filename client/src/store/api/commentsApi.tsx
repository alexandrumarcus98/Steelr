import { createAsyncThunk } from "@reduxjs/toolkit";

import type { ICommentItem } from "@/store/types/comments";

import api from "@/lib/api";

const COMMENTS_ENDPOINT = "/posts";

export const fetchCommentsForPost = createAsyncThunk<
	{ postId: string; comments: ICommentItem[] },
	string
>("comments/fetchForPost", async (postId) => {
	const { data } = await api.get(`${COMMENTS_ENDPOINT}/${postId}/comments`);

	const rawItems = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

	const comments = rawItems
		.filter((item: unknown) => typeof item === "object" && item !== null)
		.map((item: unknown) => normalizeComment(item as Record<string, unknown>))
		.filter((comment: ICommentItem) => comment.id);

	return { postId, comments };
});

export const createComment = createAsyncThunk<
	{ postId: string; comment: ICommentItem },
	{ postId: string; content: string }
>("comments/create", async ({ postId, content }) => {
	const { data } = await api.post(`${COMMENTS_ENDPOINT}/${postId}/comments`, {
		content,
	});

	const raw = (data && data.data) ?? data;
	const comment = normalizeComment(raw as Record<string, unknown>);

	return { postId, comment };
});

export const updateComment = createAsyncThunk<
	{ postId: string; comment: ICommentItem },
	{ commentId: string; postId: string; content: string }
>("comments/update", async ({ commentId, postId, content }) => {
	const { data } = await api.put(`/comments/${commentId}`, { content });

	const raw = (data && data.data) ?? data;
	const comment = normalizeComment(raw as Record<string, unknown>);

	return { postId, comment };
});

export const deleteComment = createAsyncThunk<
	{ postId: string; commentId: string },
	{ commentId: string; postId: string }
>("comments/delete", async ({ commentId, postId }) => {
	await api.delete(`/comments/${commentId}`);
	return { postId, commentId };
});

const normalizeComment = (raw: Record<string, unknown>): ICommentItem => {
	const authorRaw = raw.author as Record<string, unknown> | undefined;

	return {
		id: String(raw.id ?? raw._id ?? ""),
		postId: String(raw.post ?? ""),
		content: typeof raw.content === "string" ? raw.content : "",
		createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
		updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
		isEdited: typeof raw.isEdited === "boolean" ? raw.isEdited : undefined,
		author:
			authorRaw && typeof authorRaw === "object"
				? {
						id: String(authorRaw.id ?? authorRaw._id ?? ""),
						username: typeof authorRaw.username === "string" ? String(authorRaw.username) : "",
					}
				: undefined,
	};
};
