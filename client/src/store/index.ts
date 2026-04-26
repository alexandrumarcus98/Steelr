import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "@/store/postsSlice";
import conversationsReducer from "@/store/conversationsSlice";

export const store = configureStore({
	reducer: {
		posts: postsReducer,
		conversations: conversationsReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
