import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import type { ConversationItem } from "@/store/types";

const CONVERSATIONS_ENDPOINT =
	import.meta.env.VITE_CONVERSATIONS_ENDPOINT || "/conversations";

interface ConversationsState {
	items: ConversationItem[];
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	selectedConversationId: string | null;
}

const initialState: ConversationsState = {
	items: [],
	status: "idle",
	error: null,
	selectedConversationId: null,
};

const normalizeConversation = (
	raw: Record<string, unknown>,
): ConversationItem => ({
	id: String(raw.id ?? raw._id ?? ""),
	title: typeof raw.title === "string" ? raw.title : undefined,
	lastMessage:
		typeof raw.lastMessage === "string" ? raw.lastMessage : undefined,
	lastMessageAt:
		typeof raw.lastMessageAt === "string" ? raw.lastMessageAt : undefined,
	unreadCount:
		typeof raw.unreadCount === "number" ? raw.unreadCount : undefined,
	participantsCount:
		typeof raw.participantsCount === "number"
			? raw.participantsCount
			: undefined,
});

export const fetchConversations = createAsyncThunk<ConversationItem[]>(
	"conversations/fetchConversations",
	async () => {
		const { data } = await api.get(CONVERSATIONS_ENDPOINT);

		const rawItems = Array.isArray(data?.data)
			? data.data
			: Array.isArray(data?.items)
				? data.items
				: Array.isArray(data)
					? data
					: [];

		return rawItems
			.filter((item: unknown) => typeof item === "object" && item !== null)
			.map((item: unknown) =>
				normalizeConversation(item as Record<string, unknown>),
			)
			.filter((conversation: ConversationItem) => conversation.id);
	},
);

const conversationsSlice = createSlice({
	name: "conversations",
	initialState,
	reducers: {
		selectConversation(state, action: PayloadAction<string>) {
			state.selectedConversationId = action.payload;
		},
		clearConversationSelection(state) {
			state.selectedConversationId = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchConversations.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchConversations.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.items = action.payload;

				if (
					!state.selectedConversationId &&
					action.payload.length > 0 &&
					action.payload[0]
				) {
					state.selectedConversationId = action.payload[0].id;
				}
			})
			.addCase(fetchConversations.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message ?? "Failed to load conversations";
			});
	},
});

export const { selectConversation, clearConversationSelection } =
	conversationsSlice.actions;
export default conversationsSlice.reducer;
