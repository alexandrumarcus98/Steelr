import type { User, UserLocation } from "@/store/types/auth";

export interface UserSearchResult extends User {
	isFriend: boolean;
	distanceLabel: string;
}

export interface SearchUsersParams {
	query: string;
	page?: number;
	limit?: number;
}

export interface SearchUsersResult {
	users: UserSearchResult[];
	total: number;
	page: number;
	limit: number;
}

export interface FriendActionResult {
	isFriend: boolean;
	friendsCount: number;
}

export type { UserLocation };
