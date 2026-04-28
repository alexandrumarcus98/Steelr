import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

import type { DashboardStats } from "@/store/types/dashboard";

export const fetchDashboardStats = createAsyncThunk(
	"dashboard/fetchStats",
	async () => {
		const { data } = await api.get("/posts/dashboard/stats");
		return data.data as DashboardStats;
	},
);
