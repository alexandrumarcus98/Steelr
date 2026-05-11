import type { IPostItem } from "@/store/types/posts";

export interface IDashboardStats {
	totalPosts: number;
	totalViews: number;
	totalLikes: number;
	recentPosts: IPostItem[];
}

export interface IDashboardState {
	stats: IDashboardStats | null;
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
}
