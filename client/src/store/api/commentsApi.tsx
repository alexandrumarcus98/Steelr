import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

import type { CommentItem } from "@/store/types/comments";

const COMMENTS_ENDPOINT = "/posts"; // we will call /posts/:postId/comments

export const fetchCommentsForPost = createAsyncThunk<
	{ postId: string; comments: CommentItem[] },
	string
>("comments/fetchForPost", async (postId) => {
	const { data } = await api.get(`${COMMENTS_ENDPOINT}/${postId}/comments`);

	const rawItems = Array.isArray(data?.data)
		? data.data
		: Array.isArray(data)
			? data
			: [];

	const comments = rawItems
		.filter((item: unknown) => typeof item === "object" && item !== null)
		.map((item: unknown) => normalizeComment(item as Record<string, unknown>))
		.filter((comment: CommentItem) => comment.id);

	return { postId, comments };
});

export const createComment = createAsyncThunk<
	{ postId: string; comment: CommentItem },
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
	{ postId: string; comment: CommentItem },
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

const normalizeComment = (raw: Record<string, unknown>): CommentItem => ({
	id: String(raw.id ?? raw._id ?? ""),
	postId: String(raw.post ?? ""),
	content: typeof raw.content === "string" ? raw.content : "",
	createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
	updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
	isEdited: typeof raw.isEdited === "boolean" ? raw.isEdited : undefined,
	author:
		typeof raw.author === "object" && raw.author !== null
			? {
					id: String((raw.author as any).id ?? (raw.author as any)._id ?? ""),
					username:
						typeof (raw.author as any).username === "string"
							? String((raw.author as any).username)
							: "",
				}
			: undefined,
});
