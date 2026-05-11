import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { fetchUsers, searchUsers } from "@/store/api/usersApi";
import { IUsersState } from "@/store/types/users";

export const initialState: IUsersState = {
	items: [],
	status: "idle",
	error: null,
};

const usersSlice = createSlice({
	name: "users",
	initialState,
	reducers: {
		setUsers(state, action: PayloadAction<IUsersState["items"]>) {
			state.items = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUsers.fulfilled, (state, action) => {
				state.items = action.payload;
			})
			.addCase(searchUsers.fulfilled, (state, action) => {
				state.items = action.payload.users;
			})
			.addCase(fetchUsers.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchUsers.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message || "Failed to fetch users.";
			})
			.addCase(searchUsers.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(searchUsers.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message || "Failed to search users.";
			});
	},
});

export const { setUsers } = usersSlice.actions;
export default usersSlice.reducer;
