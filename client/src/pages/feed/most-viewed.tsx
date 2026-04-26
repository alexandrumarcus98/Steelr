import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMostViewedPosts } from "@/store/postsSlice";

const MostViewedPosts = () => {
	const dispatch = useAppDispatch();
	const posts = useAppSelector((state) => state.posts.mostViewed);
	const status = useAppSelector((state) => state.posts.mostViewedStatus);
	const error = useAppSelector((state) => state.posts.mostViewedError);

	useEffect(() => {
		dispatch(fetchMostViewedPosts(50));
	}, [dispatch]);

	return (
		<div className="w-full max-w-4xl mx-auto px-4 py-8">
			<div className="mb-8">
				<Link
					to="/"
					className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
				>
					← Back to Home
				</Link>
				<h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
					📈 Most Viewed Posts
				</h1>
				<p className="text-base text-gray-600">
					Discover the most popular posts from the community
				</p>
			</div>

			{status === "loading" ? (
				<div className="space-y-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<div
							key={i}
							className="animate-pulse rounded-lg border border-gray-200 bg-gray-100 h-32"
						></div>
					))}
				</div>
			) : error ? (
				<div className="rounded-lg border border-red-200 bg-red-50 p-4">
					<p className="text-red-800">{error}</p>
				</div>
			) : posts && posts.length > 0 ? (
				<div className="space-y-4">
					{posts.map((post) => (
						<div
							key={post.id}
							className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300"
						>
							<div className="flex items-start justify-between mb-3">
								<div>
									<p className="text-sm font-medium text-gray-500">
										By {post.author?.username || "Anonymous"}
									</p>
									{post.createdAt && (
										<p className="text-xs text-gray-400">
											{new Date(post.createdAt).toLocaleDateString()}
										</p>
									)}
								</div>
							</div>

							<p className="text-base text-gray-900 mb-4 leading-relaxed">
								{post.content}
							</p>

							<div className="flex flex-wrap gap-6 pt-4 border-t border-gray-200">
								<div className="flex items-center gap-2">
									<span className="text-lg">👁️</span>
									<div>
										<p className="text-xs text-gray-500">Views</p>
										<p className="text-sm font-semibold text-gray-900">
											{post.viewsCount || 0}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-lg">❤️</span>
									<div>
										<p className="text-xs text-gray-500">Likes</p>
										<p className="text-sm font-semibold text-gray-900">
											{post.likesCount || 0}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-lg">💬</span>
									<div>
										<p className="text-xs text-gray-500">Comments</p>
										<p className="text-sm font-semibold text-gray-900">
											{post.commentsCount || 0}
										</p>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
					<p className="text-gray-600">No posts yet</p>
				</div>
			)}
		</div>
	);
};

export default MostViewedPosts;
