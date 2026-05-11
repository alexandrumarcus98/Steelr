import type { IUser, IUserLocation } from "@/store/types/auth";

export interface IUserSearchResult extends IUser {
	isFriend: boolean;
	distanceLabel: string;
}

export interface ISearchUsersParams {
	query: string;
	page?: number;
	limit?: number;
}

export interface ISearchUsersResult {
	users: IUserSearchResult[];
	total: number;
	page: number;
	limit: number;
}

export interface FriendActionResult {
	isFriend: boolean;
	friendsCount: number;
}

export interface IUsersState {
	items: IUserSearchResult[];
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
}

export type { IUserLocation };
