import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/store/slices/authSlice";
import commentsReducer from "@/store/slices/commentsSlice";
import dashboardReducer from "@/store/slices/dashboardSlice";
import postsReducer from "@/store/slices/postsSlice";
import usersReducer from "@/store/slices/usersSlice";

export const store = configureStore({
	reducer: {
		posts: postsReducer,
		comments: commentsReducer,
		dashboard: dashboardReducer,
		auth: authReducer,
		users: usersReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
