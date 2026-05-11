import React from "react";

import { Link } from "react-router-dom";

import type { PostItem } from "@/store/types/posts";

type PostCardProps = {
	post: PostItem;
	onToggleLike: (id: string, isLiked: boolean) => void;
};

export const PostCard: React.FC<PostCardProps> = ({ post, onToggleLike }) => {
	return (
		<article className="rounded-xl border border-border-soft bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
			<div className="mb-2 flex items-center justify-between gap-2">
				<p className="text-sm font-medium text-slate-300">
					{post.author?.username || "Unknown author"}
				</p>
				{post.createdAt && (
					<p className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleString()}</p>
				)}
			</div>

			{/* Title / content clickable – go to single post */}
			<Link to={`/posts/${post.id}`} className="block">
				{post.title && (
					<h2 className="font-display text-lg font-semibold tracking-tight text-slate-50">
						{post.title}
					</h2>
				)}
				<p className="mt-2 text-sm leading-6 text-slate-300">{post.content}</p>
			</Link>

			<div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
				<span>{post.viewsCount ?? 0} views</span>
				<span>{post.likesCount ?? 0} likes</span>
				<span>{post.commentsCount ?? 0} comments</span>
				<button
					type="button"
					onClick={() => onToggleLike(post.id, !!post.isLiked)}
					className="rounded-md border border-border-soft px-2.5 py-1 text-xs font-medium text-slate-200 transition-all duration-300 hover:bg-white/5"
				>
					{post.isLiked ? "Liked" : "Like"}
				</button>
			</div>
		</article>
	);
};
