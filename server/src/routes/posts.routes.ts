
import { Router } from "express";
import { authenticate } from "@/middleware";
import * as postsController from "@/controllers/posts.controller";

const router = Router();

// GET /posts - Get all public posts with pagination
router.get("/", authenticate, postsController.getPosts);

// GET /posts/most-viewed - Get most viewed posts
router.get("/most-viewed", authenticate, postsController.getMostViewed);

// GET /posts/last-visited - Get last visited posts by authenticated user
router.get("/last-visited", authenticate, postsController.getLastVisited);

// POST /posts - Create a new post
router.post("/", authenticate, postsController.createPost);

// POST /posts/:id/view - Track a view on a post
router.post("/:id/view", authenticate, postsController.trackView);

// POST /posts/:id/like - Toggle like on a post
router.post("/:id/like", authenticate, postsController.likePost);

// POST /posts/:id/unlike - Toggle unlike on a post
router.post("/:id/unlike", authenticate, postsController.unlikePost);

// GET /posts/dashboard/stats - Get dashboard statistics (must be before /:id)
router.get("/dashboard/stats", authenticate, postsController.getDashboardStats);

// GET /posts/:id - Get a single post
router.get("/:id", authenticate, postsController.getPost);

export default router;
