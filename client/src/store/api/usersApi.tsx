import { createAsyncThunk } from "@reduxjs/toolkit";

import type {
	FriendActionResult,
	ISearchUsersParams,
	ISearchUsersResult,
} from "@/store/types/users";
import type { IUserSearchResult } from "@/store/types/users";

import api from "@/lib/api";
import { USERS_ENDPOINT } from "@/lib/usersEndpoints";

const normalizeIUserSearchResult = (raw: Record<string, unknown>): IUserSearchResult => ({
	id: String(raw.id ?? raw._id ?? ""),
	username: typeof raw.username === "string" ? raw.username : "",
	email: typeof raw.email === "string" ? raw.email : "",
	roles: Array.isArray(raw.roles)
		? raw.roles.filter((role): role is string => typeof role === "string")
		: [],
	isActive: typeof raw.isActive === "boolean" ? raw.isActive : true,
	isVerified: typeof raw.isVerified === "boolean" ? raw.isVerified : false,
	location:
		typeof raw.location === "object" && raw.location !== null
			? {
					city:
						typeof (raw.location as Record<string, unknown>).city === "string"
							? String((raw.location as Record<string, unknown>).city)
							: undefined,
					country:
						typeof (raw.location as Record<string, unknown>).country === "string"
							? String((raw.location as Record<string, unknown>).country)
							: undefined,
					region:
						typeof (raw.location as Record<string, unknown>).region === "string"
							? String((raw.location as Record<string, unknown>).region)
							: undefined,
					continent:
						typeof (raw.location as Record<string, unknown>).continent === "string"
							? String((raw.location as Record<string, unknown>).continent)
							: undefined,
					source:
						typeof (raw.location as Record<string, unknown>).source === "string"
							? ((raw.location as Record<string, unknown>).source as
									| "manual"
									| "signup-ip"
									| "seed")
							: undefined,
				}
			: undefined,
	friendsCount: typeof raw.friendsCount === "number" ? raw.friendsCount : 0,
	isFriend: typeof raw.isFriend === "boolean" ? raw.isFriend : false,
	distanceLabel: typeof raw.distanceLabel === "string" ? raw.distanceLabel : "Distant",
});

export const searchUsers = createAsyncThunk<ISearchUsersResult, ISearchUsersParams>(
	"users/search",
	async ({ query, page = 1, limit = 8 }) => {
		const { data } = await api.get(`${USERS_ENDPOINT}/search`, {
			params: { q: query, page, limit },
		});

		const rawItems = Array.isArray(data?.data)
			? data.data
			: Array.isArray(data?.items)
				? data.items
				: Array.isArray(data)
					? data
					: [];

		const users = rawItems
			.filter((item: unknown) => typeof item === "object" && item !== null)
			.map((item: unknown) => normalizeIUserSearchResult(item as Record<string, unknown>))
			.filter((user: IUserSearchResult) => Boolean(user.id));

		return {
			users,
			total: typeof data?.meta?.total === "number" ? data.meta.total : users.length,
			page,
			limit,
		};
	},
);

export const addFriend = createAsyncThunk<FriendActionResult, string>(
	"users/addFriend",
	async (userId) => {
		const { data } = await api.post(`${USERS_ENDPOINT}/${userId}/friends`);
		return {
			isFriend: typeof data?.isFriend === "boolean" ? data.isFriend : true,
			friendsCount: typeof data?.friendsCount === "number" ? data.friendsCount : 0,
		};
	},
);

export const removeFriend = createAsyncThunk<FriendActionResult, string>(
	"users/removeFriend",
	async (userId) => {
		const { data } = await api.delete(`${USERS_ENDPOINT}/${userId}/friends`);
		return {
			isFriend: typeof data?.isFriend === "boolean" ? data.isFriend : false,
			friendsCount: typeof data?.friendsCount === "number" ? data.friendsCount : 0,
		};
	},
);

export const fetchUsers = createAsyncThunk<IUserSearchResult[], void>(
	"users/fetchUsers",
	async () => {
		const { data } = await api.get(USERS_ENDPOINT);

		const rawItems = Array.isArray(data?.data)
			? data.data
			: Array.isArray(data?.items)
				? data.items
				: Array.isArray(data)
					? data
					: [];

		const users = rawItems
			.filter((item: unknown) => typeof item === "object" && item !== null)
			.map((item: unknown) => normalizeIUserSearchResult(item as Record<string, unknown>))
			.filter((user: IUserSearchResult) => Boolean(user.id));

		return users;
	},
);
