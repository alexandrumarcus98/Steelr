import { configureStore } from "@reduxjs/toolkit";

import postsReducer from "@/store/slices/postsSlice";
import commentsReducer from "@/store/slices/commentsSlice";
import dashboardReducer from "@/store/slices/dashboardSlice";
import authReducer from "@/store/slices/authSlice";

export const store = configureStore({
	reducer: {
		posts: postsReducer,
		comments: commentsReducer,
		dashboard: dashboardReducer,
		auth: authReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
