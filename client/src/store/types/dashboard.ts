import type { PostItem } from "@/store/types/posts";

export interface DashboardStats {
	totalPosts: number;
	totalViews: number;
	totalLikes: number;
	recentPosts: PostItem[];
}

export interface DashboardState {
	stats: DashboardStats | null;
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
}
