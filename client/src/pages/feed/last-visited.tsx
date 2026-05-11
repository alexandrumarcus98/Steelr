import { useEffect } from "react";

import { Link } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { fetchLastVisitedPosts } from "@/store/api/postsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const LastVisitedPosts = () => {
	const { isAuthenticated } = useAuth();
	const dispatch = useAppDispatch();
	const posts = useAppSelector((state) => state.posts.lastVisited);
	const status = useAppSelector((state) => state.posts.lastVisitedStatus);
	const error = useAppSelector((state) => state.posts.lastVisitedError);

	useEffect(() => {
		if (isAuthenticated) {
			dispatch(fetchLastVisitedPosts(50));
		}
	}, [isAuthenticated, dispatch]);

	if (!isAuthenticated) {
		return (
			<div className="mx-auto w-full max-w-4xl px-4 py-8">
				<Link
					to="/"
					className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100"
				>
					← Back to Home
				</Link>
				<div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-8 text-center">
					<p className="font-medium text-yellow-200">
						Please log in to view your last visited posts
					</p>
					<Link
						to="/login"
						className="mt-4 inline-block rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
					>
						Sign In
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-4xl mx-auto px-4 py-8">
			<div className="mb-8">
				<Link
					to="/"
					className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 "
				>
					← Back to Home
				</Link>
				<h1 className="font-display mb-2 text-3xl font-semibold tracking-tight text-slate-50">
					👁️ Last Visited Posts
				</h1>
				<p className="text-base text-slate-300">Posts you've viewed recently</p>
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
									<p className="text-sm font-medium text-slate-400">
										By {post.author?.username || "Anonymous"}
									</p>
									{post.createdAt && (
										<p className="text-xs text-slate-500">
											{new Date(post.createdAt).toLocaleDateString()}
										</p>
									)}
								</div>
							</div>

							<p className="mb-4 text-base leading-relaxed text-slate-100">{post.content}</p>

							<div className="flex flex-wrap gap-6 border-t border-border-soft pt-4">
								<div className="flex items-center gap-2">
									<span className="text-lg">👁️</span>
									<div>
										<p className="text-xs text-slate-400">Views</p>
										<p className="text-sm font-semibold text-slate-50">{post.viewsCount || 0}</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-lg">❤️</span>
									<div>
										<p className="text-xs text-slate-400">Likes</p>
										<p className="text-sm font-semibold text-slate-50">{post.likesCount || 0}</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-lg">💬</span>
									<div>
										<p className="text-xs text-slate-400">Comments</p>
										<p className="text-sm font-semibold text-slate-50">{post.commentsCount || 0}</p>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="rounded-lg border border-border-soft bg-surface/70 p-8 text-center">
					<p className="text-slate-300">You haven't visited any posts yet. Start exploring!</p>
					<Link
						to="/posts/most-viewed"
						className="mt-4 inline-block rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
					>
						View Popular Posts
					</Link>
				</div>
			)}
		</div>
	);
};

export default LastVisitedPosts;
