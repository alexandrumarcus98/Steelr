import { Router } from "express";
import authRouter from "./auth.routes";
import helloRouter from "./hello.routes";
import healthRouter from "./health.routes";
import usersRouter from "./users.routes";

const router = Router();

router.use("/hello", helloRouter);
router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);

export default router;
