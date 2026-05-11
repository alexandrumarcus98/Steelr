// Posts Service
import { LikeModel, PostModel, UserModel, ViewModel } from "@/models";
import mongoose from "mongoose";

const getAuthorId = (author: unknown) => {
	if (typeof author === "string") {
		return author;
	}

	if (typeof author === "object" && author !== null) {
		const candidate = author as Record<string, unknown>;
		return String(candidate._id ?? candidate.id ?? "");
	}

	return "";
};

export const findPosts = async (page: number, limit: number, userId?: string) => {
	const skip = (page - 1) * limit;
	const accessibleAuthorIds = userId ? await getAccessibleAuthorIds(userId) : [];
	const postFilter = userId
		? { author: { $in: accessibleAuthorIds } }
		: { visibility: "public" };

	const posts = await PostModel.find(postFilter)
		.populate("author", "username email _id")
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit)
		.lean();

	const total = await PostModel.countDocuments(postFilter);
	const totalPages = Math.ceil(total / limit);

	if (!userId) {
		return {
			posts: posts.map((p) => ({
				...p,
				id: p._id.toString(),
				isLiked: false,
			})), totalPages, total
		};
	}

	const postIds = posts.map((p) => p._id);
	if (postIds.length === 0) {
		return { posts: [], totalPages, total };
	}

	const userLikes = await LikeModel.find({ user: userId, targetType: "post", targetId: { $in: postIds } }).select("targetId");
	const likedPostIds = new Set(userLikes.map((like) => like.targetId.toString()));

	return { posts: posts.map((p) => ({ ...p, id: p._id.toString(), isLiked: likedPostIds.has(p._id.toString()) })), totalPages, total };
};

export const findMostViewedPosts = async (limit: number, userId?: string) => {
	const accessibleAuthorIds = userId ? await getAccessibleAuthorIds(userId) : [];
	const filter = userId
		? { author: { $in: accessibleAuthorIds } }
		: { visibility: "public" };

	return PostModel.find(filter)
		.populate("author", "username email _id")
		.sort({ viewsCount: -1, createdAt: -1 })
		.limit(limit)
		.lean();
};

export const findLastVisitedPosts = async (userId: string, limit: number) => {
	const accessibleAuthorIds = await getAccessibleAuthorIds(userId);
	const views = await ViewModel.find({ user: userId })
		.populate({
			path: "post",
			match: { author: { $in: accessibleAuthorIds } },
			populate: { path: "author", select: "username email _id" },
		})
		.sort({ updatedAt: -1 })
		.limit(limit)
		.lean();
	return views.map((view: { post?: unknown }) => view.post).filter(Boolean);
};

export const createNewPost = async (authorId: string, content: string, mediaUrls: string[], visibility: string) => {
	const post = new PostModel({ author: authorId, content, mediaUrls, visibility });
	await post.save();
	await post.populate("author", "username email _id");
	return post;
};

export const trackPostView = async (userId: string, postId: string) => {
	if (!mongoose.Types.ObjectId.isValid(postId)) throw new Error("Invalid post ID");
	const post = await PostModel.findById(postId).select("author").lean().exec();
	if (!post) throw new Error("Post not found");
	const accessibleAuthorIds = await getAccessibleAuthorIds(userId);
	if (!accessibleAuthorIds.includes(getAuthorId(post.author))) {
		throw new Error("Post not found");
	}
	await ViewModel.findOneAndUpdate(
		{ user: userId, post: postId },
		{ $set: { user: userId, post: postId } },
		{ upsert: true, new: true }
	);
	const viewCount = await ViewModel.countDocuments({ post: postId });
	await PostModel.findByIdAndUpdate(postId, { viewsCount: viewCount });
	return viewCount;
};

export const findPostById = async (id: string, userId?: string) => {
	if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid post ID");
	const post = await PostModel.findById(id).populate("author", "username email _id").lean();

	if (!userId) {
		if (post?.visibility === "public") {
			return { ...post, id: post._id.toString(), isLiked: false };
		} else {
			throw new Error("Post not found");
		}
	}

	if (!post) throw new Error("Post not found");
	const accessibleAuthorIds = await getAccessibleAuthorIds(userId);

	if (!accessibleAuthorIds.includes(getAuthorId(post.author))) {
		throw new Error("Post not found");
	}

	const isLiked = await LikeModel.exists({ user: userId, targetType: "post", targetId: id });
	return { ...post, id: post._id.toString(), isLiked: !!isLiked };
};

export const likePost = async (postId: string, userId: string) => {
	if (!mongoose.Types.ObjectId.isValid(postId)) throw new Error("Invalid post ID");
	const post = await PostModel.findById(postId).select("author").lean().exec();
	if (!post) throw new Error("Post not found");
	const accessibleAuthorIds = await getAccessibleAuthorIds(userId);
	if (!accessibleAuthorIds.includes(getAuthorId(post.author))) {
		throw new Error("Post not found");
	}

	const result = await LikeModel.updateOne(
		{ user: userId, targetType: "post", targetId: postId },
		{ $setOnInsert: { user: userId, targetType: "post", targetId: postId } },
		{ upsert: true }
	);

	// Only increment likesCount when a new Like document was actually inserted
	if (result.upsertedCount > 0) {
		await PostModel.updateOne({ _id: postId }, { $inc: { likesCount: 1 } });
	}
};

export const unlikePost = async (postId: string, userId: string) => {
	if (!mongoose.Types.ObjectId.isValid(postId)) throw new Error("Invalid post ID");
	const post = await PostModel.findById(postId).select("author").lean().exec();
	if (!post) throw new Error("Post not found");
	const accessibleAuthorIds = await getAccessibleAuthorIds(userId);
	if (!accessibleAuthorIds.includes(getAuthorId(post.author))) {
		throw new Error("Post not found");
	}

	const result = await LikeModel.deleteOne({
		user: userId,
		targetType: "post",
		targetId: postId,
	});

	if (result.deletedCount) {
		await PostModel.updateOne({ _id: postId }, { $inc: { likesCount: -1 } });
	}
};
export const getDashboardStats = async (userId: string) => {
	const totalPosts = await PostModel.countDocuments({ author: userId });

	const authorId = new mongoose.Types.ObjectId(userId);

	const totalViews = await PostModel.aggregate([
		{ $match: { author: authorId } },
		{ $group: { _id: null, total: { $sum: "$viewsCount" } } },
	]).then((res) => res[0]?.total ?? 0);

	const totalLikes = await PostModel.aggregate([
		{ $match: { author: authorId } },
		{ $group: { _id: null, total: { $sum: "$likesCount" } } },
	]).then((res) => res[0]?.total ?? 0);

	const recentPosts = await PostModel.find({ author: userId })
		.populate("author", "username email _id")
		.sort({ createdAt: -1 })
		.limit(5)
		.lean();

	return {
		totalPosts,
		totalViews,
		totalLikes,
		recentPosts,
	};
};

const getAccessibleAuthorIds = async (userId: string) => {
	const currentUser = await UserModel.findById(userId)
		.select("friendIds")
		.lean()
		.exec();

	if (!currentUser) {
		throw new Error("User not found");
	}

	const friendIds = (currentUser.friendIds ?? []).map((friendId) =>
		friendId.toString(),
	);

	return [userId, ...friendIds];
};
