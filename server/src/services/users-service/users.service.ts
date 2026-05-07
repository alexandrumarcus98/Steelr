import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { UserModel, type UserRole } from "@/models";
import {
	toUserResponse,
	type UserLocation,
	type UserSearchResult,
	type UserUpdateInput,
	type UserStatusUpdateInput,
} from "@/types/user";
import { isDuplicateKeyError, isValidationError } from "@/utils/errors";

export { isDuplicateKeyError, isValidationError };

const SALT_ROUNDS = 12;
const USER_SELECT =
	"username email roles isVerified isActive profileLocation friendIds createdAt updatedAt";
const SEARCH_SELECT =
	"username email roles isVerified isActive profileLocation friendIds signupIp createdAt updatedAt";

type LeanUser = {
	_id: mongoose.Types.ObjectId;
	username: string;
	email: string;
	roles: UserRole[];
	isVerified: boolean;
	isActive: boolean;
	profileLocation?: UserLocation | null;
	friendIds?: Array<mongoose.Types.ObjectId | string>;
	signupIp?: string;
	createdAt?: Date;
	updatedAt?: Date;
};

type FriendMutationResult = {
	isFriend: boolean;
	friendsCount: number;
};

const normalizeText = (value?: string) => value?.trim().toLowerCase() ?? "";
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getCurrentUserSelect = () => USER_SELECT;

const same = (left?: string, right?: string) =>
	normalizeText(left) !== "" && normalizeText(left) === normalizeText(right);

const getLocationMatchScore = (
	currentLocation?: UserLocation | null,
	candidateLocation?: UserLocation | null,
) => {
	if (!currentLocation || !candidateLocation) {
		return { score: 0, label: "Distant" };
	}

	if (same(currentLocation.city, candidateLocation.city)) {
		return { score: 120, label: "Same city" };
	}

	if (same(currentLocation.country, candidateLocation.country)) {
		return { score: 90, label: "Same country" };
	}

	if (same(currentLocation.region, candidateLocation.region)) {
		return { score: 60, label: "Nearby region" };
	}

	if (same(currentLocation.continent, candidateLocation.continent)) {
		return { score: 30, label: "Same continent" };
	}

	return { score: 10, label: "Distant" };
};

const getQueryScore = (query: string, user: LeanUser) => {
	const normalizedQuery = normalizeText(query);

	if (!normalizedQuery) {
		return 0;
	}

	const username = normalizeText(user.username);
	const email = normalizeText(user.email);
	const city = normalizeText(user.profileLocation?.city);
	const country = normalizeText(user.profileLocation?.country);
	const region = normalizeText(user.profileLocation?.region);
	const continent = normalizeText(user.profileLocation?.continent);
	const signupIp = normalizeText(user.signupIp);

	if (username === normalizedQuery || email === normalizedQuery) {
		return 200;
	}

	if (username.includes(normalizedQuery)) {
		return 140;
	}

	if (email.includes(normalizedQuery)) {
		return 120;
	}

	if (signupIp && signupIp.includes(normalizedQuery)) {
		return 110;
	}

	if (city.includes(normalizedQuery)) {
		return 100;
	}

	if (country.includes(normalizedQuery)) {
		return 90;
	}

	if (region.includes(normalizedQuery)) {
		return 80;
	}

	if (continent.includes(normalizedQuery)) {
		return 70;
	}

	return 0;
};

const rankSearchUser = (
	user: LeanUser,
	currentUserId: string,
	currentFriendSet: Set<string>,
	currentLocation?: UserLocation | null,
	query = "",
) => {
	const userId = user._id.toString();
	const isFriend = currentFriendSet.has(userId);
	const locationMatch = getLocationMatchScore(currentLocation, user.profileLocation ?? null);
	const queryScore = getQueryScore(query, user);

	return {
		user,
		score: queryScore + locationMatch.score + (isFriend ? 250 : 0),
		distanceLabel: isFriend ? "Friend" : locationMatch.label,
		isFriend,
		isSelf: userId === currentUserId,
	};
};

const getFriendIds = (friendIds?: Array<mongoose.Types.ObjectId | string>) =>
	(friendIds ?? []).map((friendId) => friendId.toString());

const getAccessibleAuthorIds = async (userId: string) => {
	const currentUser = await UserModel.findById(userId)
		.select("friendIds")
		.lean()
		.exec();

	if (!currentUser) {
		throw new Error("User not found");
	}

	return [userId, ...getFriendIds(currentUser.friendIds)];
};

export const findCurrentUser = async (userId?: string) => {
	if (!userId) {
		return null;
	}

	return UserModel.findById(userId)
		.select(getCurrentUserSelect())
		.lean()
		.exec();
};

export const findUserById = async (id: string) => {
	return UserModel.findById(id)
		.select(USER_SELECT)
		.lean()
		.exec();
};

export const findUsers = async (page: number, limit: number) => {
	const skip = (page - 1) * limit;

	const [users, total] = await Promise.all([
		UserModel.find()
			.select(SEARCH_SELECT)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean()
			.exec(),
		UserModel.countDocuments(),
	]);

	return { users, total };
};

export const searchUsers = async (
	currentUserId: string,
	query: string,
	page: number,
	limit: number,
) => {
	const currentUser = await UserModel.findById(currentUserId)
		.select("profileLocation friendIds")
		.lean()
		.exec();

	if (!currentUser) {
		throw new Error("User not found");
	}

	const trimmedQuery = normalizeText(query);
	const escapedQuery = escapeRegex(trimmedQuery);
	const currentFriendSet = new Set(getFriendIds(currentUser.friendIds));
	const baseFilter: Record<string, unknown> = {
		isActive: true,
		_id: { $ne: currentUserId },
	};

	if (trimmedQuery) {
		baseFilter.$or = [
			{ username: { $regex: escapedQuery, $options: "i" } },
			{ email: { $regex: escapedQuery, $options: "i" } },
			{ "profileLocation.city": { $regex: escapedQuery, $options: "i" } },
			{ "profileLocation.country": { $regex: escapedQuery, $options: "i" } },
			{ "profileLocation.region": { $regex: escapedQuery, $options: "i" } },
			{ "profileLocation.continent": { $regex: escapedQuery, $options: "i" } },
			{ signupIp: { $regex: escapedQuery, $options: "i" } },
		];
	}

	const candidates = await UserModel.find(baseFilter)
		.select(SEARCH_SELECT)
		.lean()
		.exec();

	const ranked = candidates
		.map((candidate) =>
			rankSearchUser(
				candidate as LeanUser,
				currentUserId,
				currentFriendSet,
				currentUser.profileLocation ?? null,
				trimmedQuery,
			),
		)
		.sort((left, right) => {
			if (right.score !== left.score) {
				return right.score - left.score;
			}

			return left.user.username.localeCompare(right.user.username);
		})
		.filter((item) => !item.isSelf);

	const start = (page - 1) * limit;
	const paged = ranked.slice(start, start + limit);

	return {
		users: paged.map((item) => ({
			...toUserResponse(item.user),
			isFriend: item.isFriend,
			distanceLabel: item.distanceLabel,
		})) as UserSearchResult[],
		total: ranked.length,
	};
};

export const updateUserById = async (id: string, payload: UserUpdateInput) => {
	const { username, email, password, location } = payload;
	const updates: Record<string, unknown> = {};

	if (username) {
		updates.username = username;
	}

	if (email) {
		updates.email = email;
	}

	if (password) {
		if (password.length < 8) {
			throw new Error("password must be at least 8 characters");
		}

		updates.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
	}

	if (location) {
		updates.profileLocation = {
			city: location.city?.trim() ?? "",
			country: location.country?.trim() ?? "",
			region: location.region?.trim() ?? "",
			continent: location.continent?.trim() ?? "",
			source: location.source ?? "manual",
		};
	}

	if (Object.keys(updates).length === 0) {
		throw new Error("No valid fields to update");
	}

	return UserModel.findByIdAndUpdate(id, updates, {
		new: true,
		runValidators: true,
	})
		.select(USER_SELECT)
		.lean()
		.exec();
};

export const updateUserRoles = async (id: string, roles?: UserRole[]) => {
	if (!Array.isArray(roles) || roles.length === 0) {
		throw new Error("roles array is required");
	}

	const allowedRoles: UserRole[] = ["user", "moderator", "admin"];
	const hasInvalidRole = roles.some((role) => !allowedRoles.includes(role));

	if (hasInvalidRole) {
		throw new Error("Invalid roles provided");
	}

	return UserModel.findByIdAndUpdate(id, { roles }, { new: true, runValidators: true })
		.select(USER_SELECT)
		.lean()
		.exec();
};

export const updateUserStatus = async (
	id: string,
	payload: UserStatusUpdateInput,
) => {
	const { isActive, isVerified } = payload;

	if (typeof isActive !== "boolean" && typeof isVerified !== "boolean") {
		throw new Error("isActive or isVerified boolean is required");
	}

	const updates: UserStatusUpdateInput = {};

	if (typeof isActive === "boolean") {
		updates.isActive = isActive;
	}

	if (typeof isVerified === "boolean") {
		updates.isVerified = isVerified;
	}

	return UserModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
		.select(USER_SELECT)
		.lean()
		.exec();
};

export const deleteUserById = async (id: string) => {
	return UserModel.findByIdAndDelete(id).exec();
};

export const addFriend = async (
	currentUserId: string,
	friendUserId: string,
): Promise<FriendMutationResult> => {
	if (!mongoose.Types.ObjectId.isValid(currentUserId) || !mongoose.Types.ObjectId.isValid(friendUserId)) {
		throw new Error("Invalid user id");
	}

	if (currentUserId === friendUserId) {
		throw new Error("Cannot add yourself as a friend");
	}

	const session = await mongoose.startSession();

	try {
		await session.withTransaction(async () => {
			const [currentUser, friendUser] = await Promise.all([
				UserModel.findById(currentUserId).session(session).select("friendIds").exec(),
				UserModel.findById(friendUserId).session(session).select("friendIds").exec(),
			]);

			if (!currentUser || !friendUser) {
				throw new Error("User not found");
			}

			await Promise.all([
				UserModel.updateOne(
					{ _id: currentUserId },
					{ $addToSet: { friendIds: friendUserId } },
					{ session },
				).exec(),
				UserModel.updateOne(
					{ _id: friendUserId },
					{ $addToSet: { friendIds: currentUserId } },
					{ session },
				).exec(),
			]);
		});
	} finally {
		session.endSession();
	}

	const refreshed = await UserModel.findById(currentUserId)
		.select("friendIds")
		.lean()
		.exec();

	return {
		isFriend: true,
		friendsCount: refreshed?.friendIds?.length ?? 0,
	};
};

export const removeFriend = async (
	currentUserId: string,
	friendUserId: string,
): Promise<FriendMutationResult> => {
	if (!mongoose.Types.ObjectId.isValid(currentUserId) || !mongoose.Types.ObjectId.isValid(friendUserId)) {
		throw new Error("Invalid user id");
	}

	if (currentUserId === friendUserId) {
		throw new Error("Cannot remove yourself as a friend");
	}

	const session = await mongoose.startSession();

	try {
		await session.withTransaction(async () => {
			const [currentUser, friendUser] = await Promise.all([
				UserModel.findById(currentUserId).session(session).select("friendIds").exec(),
				UserModel.findById(friendUserId).session(session).select("friendIds").exec(),
			]);

			if (!currentUser || !friendUser) {
				throw new Error("User not found");
			}

			await Promise.all([
				UserModel.updateOne(
					{ _id: currentUserId },
					{ $pull: { friendIds: friendUserId } },
					{ session },
				).exec(),
				UserModel.updateOne(
					{ _id: friendUserId },
					{ $pull: { friendIds: currentUserId } },
					{ session },
				).exec(),
			]);
		});
	} finally {
		session.endSession();
	}

	const refreshed = await UserModel.findById(currentUserId)
		.select("friendIds")
		.lean()
		.exec();

	return {
		isFriend: false,
		friendsCount: refreshed?.friendIds?.length ?? 0,
	};
};

export const getFriendIdsForUser = async (userId: string) => {
	return getAccessibleAuthorIds(userId);
};
