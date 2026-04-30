import type { NextFunction, Request, Response } from "express";
import * as commentsService from "@/services/comments-service/comments.service";

export const getCommentsForPost = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { postId } = req.params;
		const comments = await commentsService.getCommentsForPost(postId);
		res.json({ data: comments });
	} catch (error) {
		next(error);
	}
};

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;
		const { postId } = req.params;
		const { content } = req.body;

		if (!userId) {
			res.status(401).json({ error: "Authentication required" });
			return;
		}

		if (!content || typeof content !== "string") {
			res.status(400).json({ error: "Content is required" });
			return;
		}

		const comment = await commentsService.createComment(postId, userId, content);
		res.status(201).json({ data: comment });
	} catch (error) {
		next(error);
	}
};

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;
		const { commentId } = req.params;
		const { content } = req.body;

		if (!userId) {
			res.status(401).json({ error: "Authentication required" });
			return;
		}

		const comment = await commentsService.updateComment(commentId, userId, content);
		res.json({ data: comment });
	} catch (error) {
		if ((error as Error).message.includes("not owned")) {
			res.status(403).json({ error: (error as Error).message });
			return;
		}
		next(error);
	}
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;
		const { commentId } = req.params;

		if (!userId) {
			res.status(401).json({ error: "Authentication required" });
			return;
		}

		await commentsService.deleteComment(commentId, userId);
		res.status(204).end();
	} catch (error) {
		if ((error as Error).message.includes("not owned")) {
			res.status(403).json({ error: (error as Error).message });
			return;
		}
		next(error);
	}
};
