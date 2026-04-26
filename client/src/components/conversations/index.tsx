import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	fetchConversations,
	selectConversation,
} from "@/store/conversationsSlice";

const Conversations: React.FC = () => {
	const dispatch = useAppDispatch();
	const { items, status, error, selectedConversationId } = useAppSelector(
		(state) => state.conversations,
	);

	useEffect(() => {
		dispatch(fetchConversations());
	}, [dispatch]);

	const selectedConversation = items.find(
		(item) => item.id === selectedConversationId,
	);

	return (
		<div className="grid gap-4 lg:grid-cols-[320px,1fr]">
			<aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
				<div className="mb-3">
					<h1 className="text-xl font-semibold tracking-tight text-gray-900">
						Conversations
					</h1>
					<p className="text-sm text-gray-600">Direct messages and threads</p>
				</div>

				{status === "loading" && (
					<p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
						Loading conversations...
					</p>
				)}

				{error && (
					<p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
						{error}
					</p>
				)}

				<div className="space-y-2">
					{items.map((conversation) => {
						const active = selectedConversationId === conversation.id;
						return (
							<button
								key={conversation.id}
								type="button"
								onClick={() => dispatch(selectConversation(conversation.id))}
								className={`w-full rounded-lg border px-3 py-2 text-left transition-all duration-300 ${
									active
										? "border-gray-900 bg-gray-900 text-white"
										: "border-gray-200 bg-white hover:bg-gray-50"
								}`}
							>
								<p className="text-sm font-medium">
									{conversation.title || "Untitled conversation"}
								</p>
								<p
									className={`mt-1 text-xs ${active ? "text-gray-200" : "text-gray-500"}`}
								>
									Unread: {conversation.unreadCount ?? 0}
								</p>
							</button>
						);
					})}
				</div>
			</aside>

			<section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
				{selectedConversation ? (
					<>
						<h2 className="text-lg font-semibold tracking-tight text-gray-900">
							{selectedConversation.title || "Conversation"}
						</h2>
						<p className="mt-2 text-sm text-gray-600">
							{selectedConversation.lastMessage ||
								"No messages available for this thread yet."}
						</p>
						<div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
							<span>
								Participants: {selectedConversation.participantsCount ?? 0}
							</span>
							<span>Unread: {selectedConversation.unreadCount ?? 0}</span>
							{selectedConversation.lastMessageAt && (
								<span>
									Updated:{" "}
									{new Date(
										selectedConversation.lastMessageAt,
									).toLocaleString()}
								</span>
							)}
						</div>
					</>
				) : (
					<p className="text-sm text-gray-600">
						Select a conversation to view details.
					</p>
				)}
			</section>
		</div>
	);
};

export default Conversations;
