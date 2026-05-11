import { Router } from "express";

import { authenticate } from "@/middleware";

import { commentsController } from "@/controllers/comments-controller/comments.controller";

const router = Router();

router.get("/posts/:postId/comments", authenticate, commentsController.getCommentsForPost);
router.post("/posts/:postId/comments", authenticate, commentsController.createComment);
router.put("/comments/:commentId", authenticate, commentsController.updateComment);
router.delete("/comments/:commentId", authenticate, commentsController.deleteComment);

export default router;
