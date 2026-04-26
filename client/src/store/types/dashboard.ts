export interface DashboardStats {
	totalPosts: number;
	totalViews: number;
	totalLikes: number;
	recentPosts: any[];
}

export interface DashboardState {
	stats: DashboardStats | null;
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
}
