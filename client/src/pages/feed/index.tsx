import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPosts, likePost, unlikePost, setSort } from "@/store/postsSlice";
import { PostCard } from "../../components/posts/PostCard";

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

	const handleToggleLike = (id: string, isLiked: boolean) => {
		if (isLiked) {
			dispatch(unlikePost(id));
		} else {
			dispatch(likePost(id));
		}
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

			{items.map((post) => (
				<PostCard key={post.id} post={post} onToggleLike={handleToggleLike} />
			))}

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
