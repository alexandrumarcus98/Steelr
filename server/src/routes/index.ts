import { Router } from "express";
import authRouter from "@/routes/auth.routes";
import helloRouter from "@/routes/hello.routes";
import healthRouter from "@/routes/health.routes";
import usersRouter from "@/routes/users.routes";
import postsRouter from "@/routes/posts.routes";

const router = Router();

router.use("/hello", helloRouter);
router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/posts", postsRouter);

export default router;
