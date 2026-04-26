import type { PostVisibility } from "@/models";

export interface CreatePostBody {
  content?: string;
  mediaUrls?: string[];
  visibility?: PostVisibility;
}
