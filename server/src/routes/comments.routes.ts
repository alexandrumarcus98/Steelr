import { Router } from "express";
import { authenticate } from "@/middleware";
import * as commentsController from "@/controllers/comments.controller";

const router = Router();

// List comments for a post (public read)
router.get("/posts/:postId/comments", authenticate, commentsController.getCommentsForPost);

// Create comment on a post (auth)
router.post("/posts/:postId/comments", authenticate, commentsController.createComment);

// Edit own comment
router.put("/comments/:commentId", authenticate, commentsController.updateComment);

// Delete own comment
router.delete("/comments/:commentId", authenticate, commentsController.deleteComment);

export default router;
