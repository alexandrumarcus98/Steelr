import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "@/providers/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	fetchMostViewedPosts,
	fetchLastVisitedPosts,
} from "@/store/api/postsApi";
import type { PostItem } from "@/store/types/posts";

interface PostCardProps {
	title: string;
	posts: PostItem[];
	link: string;
	status: "idle" | "loading" | "succeeded" | "failed";
}

function App() {
	const { isAuthenticated } = useAuth();
	const { pathname } = useLocation();
	const dispatch = useAppDispatch();
	const mostViewed = useAppSelector((state) => state.posts.mostViewed);
	const lastVisited = useAppSelector((state) => state.posts.lastVisited);
	const mostViewedStatus = useAppSelector(
		(state) => state.posts.mostViewedStatus
	);
	const lastVisitedStatus = useAppSelector(
		(state) => state.posts.lastVisitedStatus
	);
	const authLinkState = { from: pathname };

	useEffect(() => {
		if (isAuthenticated) {
			dispatch(fetchMostViewedPosts(3));
			dispatch(fetchLastVisitedPosts(3));
		}
	}, [isAuthenticated, dispatch]);

	const PostCard = ({ title, posts, link, status }: PostCardProps) => (
		<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
			</div>

			{status === "loading" ? (
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="animate-pulse rounded-lg bg-gray-200 h-12"
						></div>
					))}
				</div>
			) : posts && posts.length > 0 ? (
				<div className="space-y-3 mb-4">
					{posts.slice(0, 3).map((post) => (
						<div
							key={post.id}
							className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 transition-colors cursor-pointer"
						>
							<p className="text-sm font-medium text-gray-900 truncate">
								{post.content.substring(0, 60)}...
							</p>
							<div className="mt-2 flex gap-4 text-xs text-gray-500">
								<span>👁️ {post.viewsCount || 0}</span>
								<span>❤️ {post.likesCount || 0}</span>
								<span>💬 {post.commentsCount || 0}</span>
							</div>
						</div>
					))}
				</div>
			) : (
				<p className="text-sm text-gray-500 mb-4">No posts yet</p>
			)}

			<Link
				to={link}
				className="inline-flex items-center justify-center w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-black hover:opacity-95"
			>
				See More →
			</Link>
		</div>
	);

	return (
		<div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-50 px-4 py-10 transition-colors duration-200 dark:bg-slate-950 sm:px-6 lg:px-8">
			<div className="w-full max-w-5xl">
				<div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 sm:p-10">
					<div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 dark:bg-slate-100 dark:text-slate-900">
						ST
					</div>
					<h1 className="text-center text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
						Steelr Workspace
					</h1>
					<p className="mx-auto mt-3 max-w-xl text-center text-base text-slate-600 dark:text-slate-400 sm:text-lg">
						Minimal social platform: connect, share, and engage with your
						community.
					</p>

					<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
						{isAuthenticated ? (
							<Link
								to="/dashboard"
								className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-slate-800 hover:opacity-95 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white sm:w-auto"
							>
								Go to Dashboard
							</Link>
						) : (
							<>
						<Link
							to="/login"
							state={authLinkState}
							className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-slate-800 hover:opacity-95 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white sm:w-auto"
						>
							Sign In
						</Link>
						<Link
							to="/register"
							state={authLinkState}
							className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition-all duration-300 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800 sm:w-auto"
						>
									Create Account
								</Link>
							</>
						)}
					</div>

					<div className="mt-10 grid gap-3 sm:grid-cols-3">
						<div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm text-slate-700 transition-all duration-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
							Users + RBAC
						</div>
						<div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm text-slate-700 transition-all duration-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
							Auth + Session
						</div>
						<div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm text-slate-700 transition-all duration-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
							Social Feed
						</div>
					</div>
				</div>

				{isAuthenticated && (
					<div className="grid gap-6 md:grid-cols-2">
						<PostCard
							title="📈 Most Viewed Posts"
							posts={mostViewed}
							link="/posts/most-viewed"
							status={mostViewedStatus}
						/>
						<PostCard
							title="👁️ Last Visited Posts"
							posts={lastVisited}
							link="/posts/last-visited"
							status={lastVisitedStatus}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
