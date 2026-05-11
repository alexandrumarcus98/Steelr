import { createSlice } from "@reduxjs/toolkit";

import { fetchDashboardStats } from "@/store/api/dashboardApi";
import type { DashboardState } from "@/store/types/dashboard";

const initialState: DashboardState = {
	stats: null,
	status: "idle",
	error: null,
};

const dashboardSlice = createSlice({
	name: "dashboard",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchDashboardStats.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchDashboardStats.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.stats = action.payload;
			})
			.addCase(fetchDashboardStats.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message ?? "Failed to load stats";
			});
	},
});

export default dashboardSlice.reducer;
