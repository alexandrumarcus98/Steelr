import { Router } from "express";

import authRouter from "@/routes/auth-routes/auth.routes";
import usersRouter from "@/routes/users-routes/users.routes";
import postsRouter from "@/routes/posts-routes/posts.routes";
import commentsRouter from "@/routes/comments-routes/comments.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/posts", postsRouter);
router.use("/", commentsRouter);

export default router;
