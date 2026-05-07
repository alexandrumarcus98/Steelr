import { useEffect } from "react";
import { Link } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchLastVisitedPosts } from "@/store/api/postsApi";
import { useAuth } from "@/providers/auth";

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
			<div className="w-full max-w-4xl mx-auto px-4 py-8">
				<Link
					to="/"
					className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
				>
					← Back to Home
				</Link>
				<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-8 text-center dark:border-yellow-900/40 dark:bg-yellow-950/40">
					<p className="font-medium text-yellow-800 dark:text-yellow-300">
						Please log in to view your last visited posts
					</p>
					<Link
						to="/login"
						className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
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
					className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
				>
					← Back to Home
				</Link>
				<h1 className="mb-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
					👁️ Last Visited Posts
				</h1>
				<p className="text-base text-slate-600 dark:text-slate-400">Posts you've viewed recently</p>
			</div>

			{status === "loading" ? (
				<div className="space-y-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<div
							key={i}
							className="h-32 animate-pulse rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
						></div>
					))}
				</div>
			) : error ? (
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/40">
					<p className="text-red-800 dark:text-red-300">{error}</p>
				</div>
			) : posts && posts.length > 0 ? (
				<div className="space-y-4">
					{posts.map((post) => (
						<div
							key={post.id}
							className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
						>
							<div className="flex items-start justify-between mb-3">
								<div>
									<p className="text-sm font-medium text-slate-500 dark:text-slate-400">
										By {post.author?.username || "Anonymous"}
									</p>
									{post.createdAt && (
										<p className="text-xs text-slate-400 dark:text-slate-500">
											{new Date(post.createdAt).toLocaleDateString()}
										</p>
									)}
								</div>
							</div>

							<p className="mb-4 text-base leading-relaxed text-slate-900 dark:text-slate-100">
								{post.content}
							</p>

							<div className="flex flex-wrap gap-6 border-t border-slate-200 pt-4 dark:border-slate-800">
								<div className="flex items-center gap-2">
									<span className="text-lg">👁️</span>
									<div>
										<p className="text-xs text-slate-500 dark:text-slate-400">Views</p>
										<p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
											{post.viewsCount || 0}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-lg">❤️</span>
									<div>
										<p className="text-xs text-slate-500 dark:text-slate-400">Likes</p>
										<p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
											{post.likesCount || 0}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-lg">💬</span>
									<div>
										<p className="text-xs text-slate-500 dark:text-slate-400">Comments</p>
										<p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
											{post.commentsCount || 0}
										</p>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-950">
					<p className="text-slate-600 dark:text-slate-400">
						You haven't visited any posts yet. Start exploring!
					</p>
					<Link
						to="/posts/most-viewed"
						className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
					>
						View Popular Posts
					</Link>
				</div>
			)}
		</div>
	);
};

export default LastVisitedPosts;
