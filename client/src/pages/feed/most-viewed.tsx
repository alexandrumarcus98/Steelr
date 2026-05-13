import { useEffect } from "react";

import { Link } from "react-router-dom";

import { fetchMostViewedPosts } from "@/store/api/postsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const MostViewedPosts = () => {
	const dispatch = useAppDispatch();
	const posts = useAppSelector((state) => state.posts.mostViewed);
	const status = useAppSelector((state) => state.posts.mostViewedStatus);
	const error = useAppSelector((state) => state.posts.mostViewedError);

	useEffect(() => {
		dispatch(fetchMostViewedPosts(50));
	}, [dispatch]);

	return (
		<div className="mx-auto w-full max-w-4xl px-4 py-8">
			<div className="mb-8">
				<Link
					to="/"
					className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-text"
				>
					← Back to Home
				</Link>
				<h1 className="font-display mb-2 text-3xl font-semibold tracking-tight text-text">
					📈 Most Viewed Posts
				</h1>
				<p className="text-base text-muted">Discover the most popular posts from the community</p>
			</div>

			{status === "loading" ? (
				<div className="space-y-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<div
							key={i}
							className="h-32 animate-pulse rounded-lg border border-border-soft bg-surface/70"
						></div>
					))}
				</div>
			) : error ? (
				<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
					<p className="text-red-200">{error}</p>
				</div>
			) : posts && posts.length > 0 ? (
				<div className="space-y-4">
					{posts.map((post) => (
						<div
							key={post.id}
							className="rounded-xl border border-border-soft bg-surface p-6 shadow-sm transition-all duration-300 hover:shadow-md"
						>
							<div className="flex items-start justify-between mb-3">
								<div>
									<p className="text-sm font-medium text-muted">
										By {post.author?.username || "Anonymous"}
									</p>
									{post.createdAt && (
										<p className="text-xs text-muted">
											{new Date(post.createdAt).toLocaleDateString()}
										</p>
									)}
								</div>
							</div>

							<p className="mb-4 text-base leading-relaxed text-text">{post.content}</p>

							<div className="flex flex-wrap gap-6 border-t border-border-soft pt-4">
								<div className="flex items-center gap-2">
									<span className="text-lg">👁️</span>
									<div>
										<p className="text-xs text-muted">Views</p>
										<p className="text-sm font-semibold text-text">{post.viewsCount || 0}</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-lg">❤️</span>
									<div>
										<p className="text-xs text-muted">Likes</p>
										<p className="text-sm font-semibold text-text">{post.likesCount || 0}</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-lg">💬</span>
									<div>
										<p className="text-xs text-muted">Comments</p>
										<p className="text-sm font-semibold text-text">{post.commentsCount || 0}</p>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="rounded-lg border border-border-soft bg-surface/70 p-8 text-center">
					<p className="text-muted">No posts yet</p>
				</div>
			)}
		</div>
	);
};

export default MostViewedPosts;
