import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { fetchDashboardStats } from "@/store/api/dashboardApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { IPostItem } from "@/store/types/posts";

const dashboardNavItems = ["Overview", "Analytics", "Revenue", "Users", "Reports", "Settings"];

const Dashboard: React.FC = () => {
	const [activeTab, setActiveTab] = useState("Analytics");
	const dispatch = useAppDispatch();

	const { stats, status, error } = useAppSelector((state) => state.dashboard);

	useEffect(() => {
		dispatch(fetchDashboardStats());
	}, [dispatch]);

	const totalPosts = stats?.totalPosts ?? 0;
	const totalViews = stats?.totalViews ?? 0;
	const totalLikes = stats?.totalLikes ?? 0;
	const recentPosts = stats?.recentPosts ?? [];

	const quickStats = [
		{ label: "Total Posts", value: totalPosts.toLocaleString() },
		{ label: "Total Views", value: totalViews.toLocaleString() },
		{ label: "Total Likes", value: totalLikes.toLocaleString() },
	];

	return (
		<div className="space-y-6">
			<header className="rounded-2xl border border-border-soft bg-surface p-6 shadow-sm transition-all duration-300">
				<p className="text-sm text-muted">Welcome back</p>
				<h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-text">
					Analytics dashboard
				</h1>
				<div className="mt-4 flex flex-wrap gap-2">
					{dashboardNavItems.map((item) => {
						const active = activeTab === item;
						return (
							<button
								key={item}
								type="button"
								onClick={() => setActiveTab(item)}
								className={`rounded-lg px-3 py-1.5 text-sm transition-all duration-300 ${
									active ? "bg-cyan text-bg" : "bg-white/5 text-muted hover:bg-white/10"
								}`}
							>
								{item}
							</button>
						);
					})}
				</div>
			</header>

			<section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Quick statistics">
				{quickStats.map((stat) => (
					<article
						key={stat.label}
						className="rounded-xl border border-border-soft bg-surface p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
					>
						<p className="text-xs font-medium uppercase tracking-wide text-muted">{stat.label}</p>
						<h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-text">
							{status === "loading" ? "..." : stat.value}
						</h2>
					</article>
				))}
			</section>

			{error && (
				<div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
					{error}
				</div>
			)}

			<section className="grid gap-4 lg:grid-cols-2">
				<article className="rounded-2xl border border-border-soft bg-surface p-5 shadow-sm transition-all duration-300">
					<div className="mb-4 flex items-center justify-between">
						<h3 className="text-base font-semibold text-text">Content Streams</h3>
					</div>
					<div className="grid gap-2">
						<Link
							to="/feed"
							className="rounded-lg border border-border-soft bg-bg/70 px-3 py-2 text-sm text-muted transition-all duration-300 hover:bg-white/5"
						>
							Open feed and browse posts
						</Link>
					</div>
				</article>

				<article className="rounded-2xl border border-border-soft bg-surface p-5 shadow-sm transition-all duration-300">
					<h3 className="mb-4 text-base font-semibold text-text">Recent posts snapshot</h3>

					{status === "loading" && recentPosts.length === 0 && (
						<p className="text-sm text-muted">Loading...</p>
					)}

					<ul className="space-y-2">
						{recentPosts.length > 0
							? recentPosts.map((post: IPostItem) => (
									<li key={post.id ?? post.id}>
										<Link
											to={`/posts/${post.id ?? post.id}`}
											className="flex items-center justify-between rounded-lg border border-border-soft bg-bg/70 px-3 py-2 text-sm text-muted transition-all duration-300 hover:bg-white/5"
										>
											<span className="truncate pr-2">
												{post.content?.slice(0, 80) || "Untitled post"}
												{post.content && post.content.length > 80 ? "..." : ""}
											</span>
											<span className="shrink-0 text-xs text-muted">
												{post.viewsCount ?? 0} views
											</span>
										</Link>
									</li>
								))
							: status !== "loading" && (
									<li className="rounded-lg border border-border-soft bg-bg/70 px-3 py-2 text-sm text-muted">
										No posts loaded yet. Visit feed to fetch data.
									</li>
								)}
					</ul>
				</article>
			</section>
		</div>
	);
};

export default Dashboard;
