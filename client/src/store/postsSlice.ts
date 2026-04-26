import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "../lib/api";
import type { PostItem, PostSort } from "./types";

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
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  sort: PostSort;
  page: number;
  limit: number;
  hasMore: boolean;
}

const initialState: PostsState = {
  items: [],
  status: "idle",
  error: null,
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

export const likePost = createAsyncThunk<string, string>(
  "posts/likePost",
  async (postId) => {
    await api.post(`${POSTS_ENDPOINT}/${postId}/like`);
    return postId;
  },
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
      .addCase(likePost.fulfilled, (state, action) => {
        state.items = state.items.map((post) => {
          if (post.id !== action.payload) {
            return post;
          }

          return {
            ...post,
            isLiked: true,
            likesCount: (post.likesCount ?? 0) + (post.isLiked ? 0 : 1),
          };
        });
      });
  },
});

export const { setSort, resetPosts } = postsSlice.actions;
export default postsSlice.reducer;
