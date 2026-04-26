import { Router } from "express";
import authRouter from "@/routes/auth.routes";
import usersRouter from "@/routes/users.routes";
import postsRouter from "@/routes/posts.routes";
import commentsRouter from "@/routes/comments.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/posts", postsRouter);
router.use("/", commentsRouter); // Comments routes are nested under posts, but we can mount them at the root for cleaner URLs

export default router;
