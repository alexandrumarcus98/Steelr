import { Link } from "react-router-dom";

import { type IPostItem } from "@/store/types/posts";

interface IPostCardProps {
	title: string;
	posts: IPostItem[];
	link: string;
	status: "idle" | "loading" | "succeeded" | "failed";
}

const PostCard = ({ title, posts, link, status }: IPostCardProps) => (
	<div className="rounded-2xl border border-border-soft bg-surface/90 p-6 shadow-sm">
		<div className="mb-4 flex items-center justify-between">
			<h3 className="text-lg font-semibold text-slate-50">{title}</h3>
		</div>

		{status === "loading" ? (
			<div className="space-y-3">
				{[1, 2, 3].map((i) => (
					<div key={i} className="h-12 animate-pulse rounded-lg bg-white/5"></div>
				))}
			</div>
		) : posts && posts.length > 0 ? (
			<div className="mb-4 space-y-3">
				{posts.slice(0, 3).map((post) => (
					<div
						key={post.id}
						className="cursor-pointer rounded-lg border border-border-soft bg-bg/70 p-3 transition-colors hover:bg-white/5"
					>
						<p className="truncate text-sm font-medium text-slate-800">
							{post.content.substring(0, 60)}...
						</p>
						<div className="mt-2 flex gap-4 text-xs text-slate-400">
							<span>👁️ {post.viewsCount || 0}</span>
							<span>❤️ {post.likesCount || 0}</span>
							<span>💬 {post.commentsCount || 0}</span>
						</div>
					</div>
				))}
			</div>
		) : (
			<p className="mb-4 text-sm text-slate-400">No posts yet</p>
		)}

		<Link
			to={link}
			className="inline-flex w-full items-center justify-center rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
		>
			See More →
		</Link>
	</div>
);

export default PostCard;
