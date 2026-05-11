import React, { useEffect } from "react";

import { Link } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import {
	fetchLastVisitedPosts,
	fetchMostViewedPosts,
	fetchPosts,
	likePost,
	unlikePost,
} from "@/store/api/postsApi";
import {
	addFriend as addFriendThunk,
	removeFriend as removeFriendThunk,
	searchUsers as searchUsersThunk,
} from "@/store/api/usersApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSort } from "@/store/slices/postsSlice";

import type { IPostItem } from "@/store/types/posts";
import type { IUserSearchResult } from "@/store/types/users";

const getInitials = (username?: string) => (username ? username.slice(0, 2).toUpperCase() : "?");

const formatRelativeTime = (dateStr?: string): string => {
	if (!dateStr) return "";
	const diff = Date.now() - new Date(dateStr).getTime();
	const mins = Math.floor(diff / 60_000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h`;
	return `${Math.floor(hrs / 24)}d`;
};

const EyeIcon = () => (
	<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
		/>
		<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
	</svg>
);

const CommentIcon = () => (
	<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
		/>
	</svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
	<svg
		className="h-4 w-4"
		fill={filled ? "currentColor" : "none"}
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke="currentColor"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
		/>
	</svg>
);

// ─── skeleton card ─────────────────────────────────────────────────────────────

const SkeletonCard = () => (
	<div className="animate-pulse rounded-2xl border border-border-soft bg-surface p-5">
		<div className="mb-4 flex items-center gap-3">
			<div className="h-10 w-10 rounded-full bg-slate-200" />
			<div className="space-y-2">
				<div className="h-3 w-24 rounded-full bg-slate-200" />
				<div className="h-2.5 w-16 rounded-full bg-slate-200" />
			</div>
		</div>
		<div className="space-y-2">
			<div className="h-3 w-3/4 rounded-full bg-slate-200" />
			<div className="h-3 w-full rounded-full bg-slate-200" />
			<div className="h-3 w-1/2 rounded-full bg-slate-200" />
		</div>
	</div>
);

const FeedComponent: React.FC = (): React.ReactNode => {
	const { items, status, error, sort, page, limit, hasMore } = useAppSelector(
		(state) => state.posts,
	);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [searchResults, setSearchResults] = React.useState<IUserSearchResult[]>([]);
	const [searchStatus, setSearchStatus] = React.useState<
		"idle" | "loading" | "succeeded" | "failed"
	>("idle");
	const [searchError, setSearchError] = React.useState<string | null>(null);
	const [updatingFriendId, setUpdatingFriendId] = React.useState<string | null>(null);
	const { user } = useAuth();
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(fetchPosts({ sort, page: 1, limit }));
	}, [dispatch, sort, limit]);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setSearchStatus("loading");
			setSearchError(null);

			void dispatch(searchUsersThunk({ query: searchQuery, limit: 8, page: 1 }))
				.unwrap()
				.then((result) => {
					setSearchResults(result.users);
					setSearchStatus("succeeded");
				})
				.catch((error: unknown) => {
					setSearchResults([]);
					setSearchStatus("failed");
					setSearchError(error instanceof Error ? error.message : "Failed to search users");
				});
		}, 250);

		return () => window.clearTimeout(timer);
	}, [dispatch, searchQuery]);

	const handleLoadMore = () => {
		dispatch(fetchPosts({ sort, page: page + 1, limit }));
	};

	const refreshSocialFeed = () => {
		dispatch(fetchPosts({ sort, page: 1, limit }));
		dispatch(fetchMostViewedPosts(3));
		dispatch(fetchLastVisitedPosts(3));
	};

	const handleToggleLike = (id: string, isLiked: boolean) => {
		if (isLiked) {
			dispatch(unlikePost(id));
		} else {
			dispatch(likePost(id));
		}
	};

	const handleToggleFriend = async (targetUser: IUserSearchResult) => {
		try {
			setUpdatingFriendId(targetUser.id);

			const result = targetUser.isFriend
				? await dispatch(removeFriendThunk(targetUser.id)).unwrap()
				: await dispatch(addFriendThunk(targetUser.id)).unwrap();

			setSearchResults((current) =>
				current.map((candidate) =>
					candidate.id === targetUser.id
						? {
								...candidate,
								isFriend: result.isFriend,
								friendsCount: result.friendsCount,
								distanceLabel: result.isFriend ? "Friend" : candidate.distanceLabel,
							}
						: candidate,
				),
			);
			refreshSocialFeed();
		} catch (error: unknown) {
			const apiError = error as {
				response?: {
					data?: {
						message?: string;
					};
				};
			};
			setSearchError(apiError.response?.data?.message || "Failed to update friend status");
		} finally {
			setUpdatingFriendId(null);
		}
	};

	return (
		<div className="mx-auto max-w-3xl">
			<div className="mb-1 px-1">
				<h1 className="font-display text-xl font-bold text-slate-50">Home Feed</h1>
				<p className="mt-0.5 text-sm text-slate-500">Recent posts from your network</p>
			</div>

			<section className="mt-5 rounded-2xl border border-border-soft bg-surface p-5 shadow-sm">
				<div className="flex flex-col gap-1">
					<h2 className="text-base font-semibold text-slate-50">Find people nearby</h2>
					<p className="text-sm text-slate-500">
						Search by name, city, country, or IP. Nearby people are ranked first.
						{user?.location?.country
							? ` Your profile location: ${user.location.city ? `${user.location.city}, ` : ""}${user.location.country}.`
							: ""}
					</p>
				</div>

				<div className="mt-4">
					<label htmlFor="user-search" className="mb-2 block text-sm font-medium">
						Search users
					</label>
					<input
						id="user-search"
						type="search"
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
						placeholder="Search people by name or location"
						className="w-full rounded-xl border border-border-soft bg-bg/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan focus:ring-2 focus:ring-cyan/15"
					/>
				</div>

				{searchStatus === "loading" && <p className="mt-3 text-sm text-slate-500">Searching...</p>}

				{searchError && <p className="mt-3 text-sm text-red-600">{searchError}</p>}

				<div className="mt-4 space-y-3">
					{searchResults.map((candidate) => (
						<div
							key={candidate.id}
							className="flex flex-col gap-3 rounded-xl border border-border-soft bg-bg/70 p-4 sm:flex-row sm:items-center sm:justify-between"
						>
							<div>
								<div className="flex items-center gap-2">
									<p className="font-medium">{candidate.username}</p>
									<span className="rounded-full border border-border-soft px-2 py-0.5 text-[11px]">
										{candidate.distanceLabel}
									</span>
								</div>
								<p className="text-sm">
									{candidate.location?.city || candidate.location?.country
										? [candidate.location?.city, candidate.location?.country]
												.filter(Boolean)
												.join(", ")
										: candidate.email}
								</p>
							</div>

							<button
								type="button"
								onClick={() => handleToggleFriend(candidate)}
								disabled={updatingFriendId === candidate.id}
								className="inline-flex items-center justify-center rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-bg transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
							>
								{updatingFriendId === candidate.id
									? "Saving..."
									: candidate.isFriend
										? "Remove friend"
										: "Add friend"}
							</button>
						</div>
					))}

					{searchStatus !== "loading" && searchResults.length === 0 && !searchError && (
						<p className="text-sm text-slate-500">No users found.</p>
					)}
				</div>
			</section>

			<div className="mb-5 mt-4 flex border-b border-border-soft">
				{(["latest", "mostViewed"] as const).map((tab) => (
					<button
						key={tab}
						type="button"
						onClick={() => dispatch(setSort(tab))}
						className={`relative px-5 py-3 text-sm font-medium transition-colors duration-200 ${
							sort === tab ? "text-slate-100" : "text-slate-400 hover:text-slate-100"
						}`}
					>
						{tab === "latest" ? "For you" : "Most viewed"}
						{sort === tab && (
							<span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-cyan" />
						)}
					</button>
				))}
			</div>

			{status === "loading" && items.length === 0 && (
				<div className="space-y-3">
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			)}

			{error && (
				<div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 ">
					{error}
				</div>
			)}

			{status !== "loading" && items.length === 0 && !error && (
				<div className="rounded-2xl border border-border-soft bg-surface p-10 text-center">
					<p className="text-sm">No posts available yet.</p>
				</div>
			)}

			<div className="space-y-3">
				{items.map((post: IPostItem) => (
					<article
						key={post.id}
						className="group rounded-2xl border border-border-soft bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10"
					>
						{/* Author row */}
						<div className="mb-3 flex items-start justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet text-xs font-bold text-bg shadow-md">
									{getInitials(post.author?.username)}
								</div>
								<div className="min-w-0">
									<p className="truncate text-sm font-semibold">
										{post.author?.username ?? "Unknown"}
									</p>
									<p className="text-xs">
										@{post.author?.username?.toLowerCase() ?? "unknown"}
										{post.createdAt && (
											<>
												{" · "}
												<span className="text-slate-500">{formatRelativeTime(post.createdAt)}</span>
											</>
										)}
									</p>
								</div>
							</div>
						</div>

						<Link to={`/posts/${post.id}`} className="group/link block">
							{post.title && (
								<h2 className="mb-1.5 text-base font-semibold transition-colors duration-200 group-hover/link:text-slate-300">
									{post.title}
								</h2>
							)}
							<p className="line-clamp-3 text-sm leading-6">{post.content}</p>
						</Link>

						<div className="mt-4 flex items-center gap-5 border-t border-border-soft pt-3.5">
							<span className="flex items-center gap-1.5 text-xs">
								<EyeIcon />
								{post.viewsCount ?? 0}
							</span>

							<span className="flex items-center gap-1.5 text-xs">
								<CommentIcon />
								{post.commentsCount ?? 0}
							</span>

							<button
								type="button"
								onClick={() => handleToggleLike(post.id, !!post.isLiked)}
								className={`ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
									post.isLiked
										? "bg-cyan/10 text-cyan ring-1 ring-cyan/20 hover:bg-cyan/15"
										: "text-slate-400 hover:bg-white/5"
								}`}
							>
								<HeartIcon filled={!!post.isLiked} />
								{post.likesCount ?? 0}
							</button>
						</div>
					</article>
				))}
			</div>

			{hasMore && items.length > 0 && (
				<div className="flex justify-center pt-6">
					<button
						type="button"
						onClick={handleLoadMore}
						disabled={status === "loading"}
						className="rounded-full border border-border-soft bg-surface px-6 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{status === "loading" ? "Loading…" : "Load more"}
					</button>
				</div>
			)}
		</div>
	);
};

export default FeedComponent;
