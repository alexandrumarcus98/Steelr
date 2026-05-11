import { createAsyncThunk } from "@reduxjs/toolkit";

import type { DashboardStats } from "@/store/types/dashboard";

import api from "@/lib/api";

export const fetchDashboardStats = createAsyncThunk("dashboard/fetchStats", async () => {
	const { data } = await api.get("/posts/dashboard/stats");
	return data.data as DashboardStats;
});
