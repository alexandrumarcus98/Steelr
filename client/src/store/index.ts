import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "./postsSlice";
import conversationsReducer from "./conversationsSlice";

export const store = configureStore({
	reducer: {
		posts: postsReducer,
		conversations: conversationsReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
