import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPostById, likePost, unlikePost } from "@/store/api/postsApi";

import { PostCard } from "@/components/posts/PostCard";
import { CommentsSection } from "../../components/posts/comments-section";

const PostPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const dispatch = useAppDispatch();
	const post = useAppSelector((state) => state.posts.currentPost);
	const status = useAppSelector((state) => state.posts.status);
	const error = useAppSelector((state) => state.posts.error);

	useEffect(() => {
		if (id) {
			dispatch(fetchPostById(id));
		}
	}, [dispatch, id]);

	const handleToggleLike = (postId: string, isLiked: boolean) => {
		if (isLiked) dispatch(unlikePost(postId));
		else dispatch(likePost(postId));
	};

	if (status === "loading" && !post) {
		return <div className="p-4 text-sm text-gray-600">Loading post...</div>;
	}

	if (error) {
		return (
			<div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
				{error}
			</div>
		);
	}

	if (!post) {
		return <div className="p-4 text-sm text-gray-600">Post not found.</div>;
	}

	return (
		<div className="space-y-4">
			<PostCard post={post} onToggleLike={handleToggleLike} />
			<CommentsSection postId={post.id} />
		</div>
	);
};

export default PostPage;
