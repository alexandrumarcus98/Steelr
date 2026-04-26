import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardStats } from "@/store/api/dashboardApi";

const dashboardNavItems = [
	"Overview",
	"Analytics",
	"Revenue",
	"Users",
	"Reports",
	"Settings",
];

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
			<header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300">
				<p className="text-sm text-gray-500">Welcome back</p>
				<h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
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
									active
										? "bg-gray-900 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								{item}
							</button>
						);
					})}
				</div>
			</header>

			<section
				className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
				aria-label="Quick statistics"
			>
				{quickStats.map((stat) => (
					<article
						key={stat.label}
						className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
					>
						<p className="text-xs font-medium uppercase tracking-wide text-gray-500">
							{stat.label}
						</p>
						<h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
							{status === "loading" ? "..." : stat.value}
						</h2>
					</article>
				))}
			</section>

			{error && (
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{error}
				</div>
			)}

			<section className="grid gap-4 lg:grid-cols-2">
				<article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300">
					<div className="mb-4 flex items-center justify-between">
						<h3 className="text-base font-semibold text-gray-900">
							Content Streams
						</h3>
					</div>
					<div className="grid gap-2">
						<Link
							to="/feed"
							className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 transition-all duration-300 hover:bg-white"
						>
							Open feed and browse posts
						</Link>
					</div>
				</article>

				<article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300">
					<h3 className="mb-4 text-base font-semibold text-gray-900">
						Recent posts snapshot
					</h3>

					{status === "loading" && recentPosts.length === 0 && (
						<p className="text-sm text-gray-500">Loading...</p>
					)}

					<ul className="space-y-2">
						{recentPosts.length > 0
							? recentPosts.map((post) => (
									<li key={post.id ?? post._id}>
										<Link
											to={`/posts/${post.id ?? post._id}`}
											className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 transition-all duration-300 hover:bg-white"
										>
											<span className="truncate pr-2">
												{post.content?.slice(0, 80) || "Untitled post"}
												{post.content && post.content.length > 80 ? "..." : ""}
											</span>
											<span className="shrink-0 text-xs text-gray-500">
												{post.viewsCount ?? 0} views
											</span>
										</Link>
									</li>
								))
							: status !== "loading" && (
									<li className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
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
