import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchPosts, likePost, setSort } from "../../store/postsSlice";

const Feed: React.FC = () => {
	const dispatch = useAppDispatch();
	const { items, status, error, sort, page, limit, hasMore } = useAppSelector(
		(state) => state.posts,
	);

	useEffect(() => {
		dispatch(fetchPosts({ sort, page: 1, limit }));
	}, [dispatch, sort, limit]);

	const handleLoadMore = () => {
		dispatch(fetchPosts({ sort, page: page + 1, limit }));
	};

	return (
		<div className="space-y-6">
			<header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
				<h1 className="text-2xl font-semibold tracking-tight text-gray-900">
					Feed
				</h1>
				<p className="mt-1 text-sm text-gray-600">
					Browse recent posts and trending posts from your network.
				</p>
				<div className="mt-4 flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => dispatch(setSort("latest"))}
						className={`rounded-lg px-3 py-1.5 text-sm transition-all duration-300 ${
							sort === "latest"
								? "bg-gray-900 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						Latest
					</button>
					<button
						type="button"
						onClick={() => dispatch(setSort("mostViewed"))}
						className={`rounded-lg px-3 py-1.5 text-sm transition-all duration-300 ${
							sort === "mostViewed"
								? "bg-gray-900 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						Most viewed
					</button>
				</div>
			</header>

			{status === "loading" && items.length === 0 && (
				<div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
					Loading posts...
				</div>
			)}

			{error && (
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{error}
				</div>
			)}

			{status !== "loading" && items.length === 0 && !error && (
				<div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
					No posts available yet.
				</div>
			)}

			<div className="space-y-3">
				{items.map((post) => (
					<article
						key={post.id}
						className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
					>
						<div className="mb-2 flex items-center justify-between gap-2">
							<p className="text-sm font-medium text-gray-700">
								{post.author?.username || "Unknown author"}
							</p>
							{post.createdAt && (
								<p className="text-xs text-gray-500">
									{new Date(post.createdAt).toLocaleString()}
								</p>
							)}
						</div>

						{post.title && (
							<h2 className="text-lg font-semibold tracking-tight text-gray-900">
								{post.title}
							</h2>
						)}
						<p className="mt-2 text-sm leading-6 text-gray-700">
							{post.content}
						</p>

						<div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
							<span>{post.viewsCount ?? 0} views</span>
							<span>{post.likesCount ?? 0} likes</span>
							<span>{post.commentsCount ?? 0} comments</span>
							<button
								type="button"
								onClick={() => dispatch(likePost(post.id))}
								className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 transition-all duration-300 hover:bg-gray-100"
							>
								{post.isLiked ? "Liked" : "Like"}
							</button>
						</div>
					</article>
				))}
			</div>

			{hasMore && items.length > 0 && (
				<div className="flex justify-center">
					<button
						type="button"
						onClick={handleLoadMore}
						disabled={status === "loading"}
						className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-black disabled:opacity-70"
					>
						{status === "loading" ? "Loading..." : "Load more"}
					</button>
				</div>
			)}
		</div>
	);
};

export default Feed;
