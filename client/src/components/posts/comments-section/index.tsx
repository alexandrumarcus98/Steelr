import React, { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import {
	createComment,
	deleteComment,
	fetchCommentsForPost,
	updateComment,
} from "@/store/api/commentsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type Props = {
	postId: string;
};

export const CommentsSection: React.FC<Props> = ({ postId }) => {
	const dispatch = useAppDispatch();
	const { user } = useAuth();
	const currentUserId = user?.id;

	const comments = useAppSelector((state) => state.comments.byPostId[postId] ?? []);
	const status = useAppSelector((state) => state.comments.statusByPostId[postId] ?? "idle");
	const error = useAppSelector((state) => state.comments.errorByPostId[postId] ?? null);

	const [newContent, setNewContent] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingContent, setEditingContent] = useState("");

	useEffect(() => {
		if (status === "idle") {
			dispatch(fetchCommentsForPost(postId));
		}
	}, [dispatch, postId, status]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = newContent.trim();
		if (!trimmed) return;

		await dispatch(createComment({ postId, content: trimmed }));
		setNewContent("");
	};

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingId) return;
		const trimmed = editingContent.trim();
		if (!trimmed) return;

		await dispatch(updateComment({ commentId: editingId, postId, content: trimmed }));
		setEditingId(null);
		setEditingContent("");
	};

	const startEditing = (id: string, content: string) => {
		setEditingId(id);
		setEditingContent(content);
	};

	const cancelEditing = () => {
		setEditingId(null);
		setEditingContent("");
	};

	const handleDelete = async (id: string) => {
		await dispatch(deleteComment({ commentId: id, postId }));
	};

	return (
		<section className="rounded-xl border border-border-soft bg-surface p-5 shadow-sm">
			<h2 className="font-display text-lg font-semibold tracking-tight text-text">Comments</h2>

			{status === "loading" && comments.length === 0 && (
				<p className="mt-2 text-sm text-muted">Loading comments...</p>
			)}

			{error && <p className="mt-2 text-sm text-red-300">{error}</p>}

			{/* List */}
			<div className="mt-4 space-y-3">
				{comments.map((comment) => {
					const isEditing = editingId === comment.id;
					const isOwnComment = currentUserId === comment.author?.id;

					return (
						<div
							key={comment.id}
							className="rounded-lg border border-border-soft bg-bg/70 p-3 text-sm"
						>
							<div className="flex items-center justify-between">
								<span className="font-medium text-text">
									{comment.author?.username ?? "Unknown user"}
								</span>
								{comment.createdAt && (
									<span className="text-xs text-muted">
										{new Date(comment.createdAt).toLocaleString()}
										{comment.isEdited && " · edited"}
									</span>
								)}
							</div>

							{!isEditing && <p className="mt-2 text-text">{comment.content}</p>}

							{isEditing && (
								<form onSubmit={handleUpdate} className="mt-2 space-y-2">
									<textarea
										className="w-full rounded-md border border-border-soft bg-bg/70 p-2 text-sm text-text"
										rows={2}
										value={editingContent}
										onChange={(e) => setEditingContent(e.target.value)}
									/>
									<div className="flex gap-2">
										<button
											type="submit"
											className="rounded-md bg-cyan px-3 py-1.5 text-xs font-medium text-bg"
										>
											Save
										</button>
										<button
											type="button"
											onClick={cancelEditing}
											className="rounded-md border border-border-soft px-3 py-1.5 text-xs font-medium text-muted"
										>
											Cancel
										</button>
									</div>
								</form>
							)}

							{/* Actions – you may want to only show for own comments; you can pass currentUserId and compare */}
							{!isEditing && isOwnComment && (
								<div className="mt-2 flex gap-3 text-xs text-muted">
									<button
										type="button"
										onClick={() => startEditing(comment.id, comment.content)}
										className="hover:text-text"
									>
										Edit
									</button>
									<button
										type="button"
										onClick={() => handleDelete(comment.id)}
										className="hover:text-text"
									>
										Delete
									</button>
								</div>
							)}
						</div>
					);
				})}

				{comments.length === 0 && status !== "loading" && !error && (
					<p className="text-sm text-muted">No comments yet.</p>
				)}
			</div>

			{/* New comment */}
			<form onSubmit={handleSubmit} className="mt-4 space-y-2">
				<textarea
					className="w-full rounded-md border border-border-soft bg-bg/70 p-2 text-sm text-text"
					rows={3}
					placeholder="Write a comment..."
					value={newContent}
					onChange={(e) => setNewContent(e.target.value)}
				/>
				<div className="flex justify-end">
					<button
						type="submit"
						className="rounded-md bg-cyan px-4 py-1.5 text-sm font-medium text-bg"
					>
						Comment
					</button>
				</div>
			</form>
		</section>
	);
};
