import type { NextFunction, Request, Response } from "express";
import * as postsService from "@/services/posts.service";
import type { CreatePostBody } from "@/types/post";

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
		const { posts, total, totalPages } = await postsService.findPosts(page, limit, req.user?.id);
		res.json({ data: posts, pagination: { page, limit, total, pages: totalPages } });
	} catch (error) { next(error); }
};

export const getMostViewed = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
		const posts = await postsService.findMostViewedPosts(limit);
		res.json({ data: posts });
	} catch (error) { next(error); }
};

export const getLastVisited = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ error: "Authentication required" });
			return;
		}

		const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
		const posts = await postsService.findLastVisitedPosts(userId, limit);
		res.json({ data: posts });
	} catch (error) { next(error); }
};

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ error: "Authentication required" });
			return;
		}

		const { content, mediaUrls = [], visibility = "public" } = req.body as CreatePostBody;
		if (!content || content.trim().length === 0) {
			res.status(400).json({ error: "Content is required" });
			return;
		}
		const post = await postsService.createNewPost(userId, content.trim(), mediaUrls, visibility);
		res.status(201).json({ data: post });
	} catch (error) { next(error); }
};

export const trackView = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ error: "Authentication required" });
			return;
		}

		const { id: postId } = req.params;
		try {
			const viewCount = await postsService.trackPostView(userId, postId);
			res.json({ data: { success: true, viewsCount: viewCount } });
		} catch (err: any) {
			if (err.message === "Invalid post ID") {
				res.status(400).json({ error: err.message });
			} else if (err.message === "Post not found") {
				res.status(404).json({ error: err.message });
			} else {
				throw err;
			}
		}
	} catch (error) { next(error); }
};

export const getPost = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;

		try {
			const post = await postsService.findPostById(id, req.user?.id);
			res.json({ data: post });
		} catch (err: any) {
			if (err.message === "Invalid post ID") {
				res.status(400).json({ error: err.message });
			} else if (err.message === "Post not found") {
				res.status(404).json({ error: err.message });
			} else {
				throw err;
			}
		}
	} catch (error) { next(error); }
};

export const likePost = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;
		const { id } = req.params;

		try {
			await postsService.likePost(id, userId!);
			res.status(200).json({ ok: true });
		} catch (err: any) {
			if (err.message === "Invalid post ID") {
				res.status(400).json({ error: err.message });
			} else if (err.message === "Post not found") {
				res.status(404).json({ error: err.message });
			} else {
				throw err;
			}
		}
	} catch (err) {
		if ((err as any).code === 11000) return res.status(200).json({ ok: true });
		next(err);
	}
};


export const unlikePost = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;
		const { id } = req.params;

		try {
			await postsService.unlikePost(id, userId!);
			res.status(200).json({ ok: true });
		} catch (err: any) {
			if (err.message === "Invalid post ID") {
				res.status(400).json({ error: err.message });
			} else if (err.message === "Post not found") {
				res.status(404).json({ error: err.message });
			} else {
				throw err;
			}
		}
	} catch (err) {
		if ((err as any).code === 11000) return res.status(200).json({ ok: true });
		next(err);
	}
};
