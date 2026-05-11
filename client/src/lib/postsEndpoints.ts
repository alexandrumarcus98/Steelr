import api from "./api";

export const postsAPI = {
	// Get all public posts with pagination
	getPosts: (page = 1, limit = 20) => api.get("/posts", { params: { page, limit } }),

	// Get most viewed posts
	getMostViewed: (limit = 10) => api.get("/posts/most-viewed", { params: { limit } }),

	// Get last visited posts (requires auth)
	getLastVisited: (limit = 10) => api.get("/posts/last-visited", { params: { limit } }),

	// Create a new post
	createPost: (content: string, mediaUrls: string[] = [], visibility: string = "public") =>
		api.post("/posts", { content, mediaUrls, visibility }),

	// Get a single post
	getPost: (id: string) => api.get(`/posts/${id}`),

	// Track a view on a post
	trackView: (postId: string) => api.post(`/posts/${postId}/view`),
};
