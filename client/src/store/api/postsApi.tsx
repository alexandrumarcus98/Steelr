import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

import type { PostItem } from "@/store/types/posts";
import { FetchPostsResult, FetchPostsParams } from "@/store/types/posts";

const POSTS_ENDPOINT = import.meta.env.VITE_POSTS_ENDPOINT || "/posts";

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

export const fetchPostById = createAsyncThunk<PostItem, string>(
	"posts/fetchPostById",
	async (postId) => {
		const { data } = await api.get(`${POSTS_ENDPOINT}/${postId}`);

		const raw = (data && (data.data || data.item)) ?? data; // flexible shape like in fetchPosts

		const post = normalizePost(raw as Record<string, unknown>);

		return post;
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
