import mongoose from "mongoose";
import { CommentModel, PostModel } from "@/models";

const getCommentsForPost = async (postId: string) => {
	if (!mongoose.Types.ObjectId.isValid(postId)) {
		throw new Error("Invalid post ID");
	}

	const comments = await CommentModel.find({ post: postId })
		.populate("author", "username email _id")
		.sort({ createdAt: 1 })
		.lean();

	return comments;
};

const createComment = async (postId: string, userId: string, content: string) => {
	if (!mongoose.Types.ObjectId.isValid(postId)) {
		throw new Error("Invalid post ID");
	}

	const post = await PostModel.findById(postId).select("_id").lean();
	if (!post) {
		throw new Error("Post not found");
	}

	const comment = await CommentModel.create({
		post: postId,
		author: userId,
		content,
	});

	await PostModel.updateOne({ _id: postId }, { $inc: { commentsCount: 1 } });

	return comment;
};

const updateComment = async (
	commentId: string,
	userId: string,
	content: string,
) => {
	if (!mongoose.Types.ObjectId.isValid(commentId)) {
		throw new Error("Invalid comment ID");
	}

	const comment = await CommentModel.findOneAndUpdate(
		{ _id: commentId, author: userId },
		{ content },
		{ new: true, runValidators: true },
	).populate("author", "username email _id");

	if (!comment) {
		throw new Error("Comment not found or not owned by user");
	}

	return comment;
};

const deleteComment = async (commentId: string, userId: string) => {
	if (!mongoose.Types.ObjectId.isValid(commentId)) {
		throw new Error("Invalid comment ID");
	}

	const deleted = await CommentModel.findOneAndDelete({
		_id: commentId,
		author: userId,
	});

	if (!deleted) {
		throw new Error("Comment not found or not owned by user");
	}

	await PostModel.updateOne(
		{ _id: deleted.post },
		{ $inc: { commentsCount: -1 } },
	);
};

export const commentsService = {
	getCommentsForPost,
	createComment,
	updateComment,
	deleteComment,
};
