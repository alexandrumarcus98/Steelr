import { InferSchemaType, Model, Schema, Types, model, models } from "mongoose";

export type PostVisibility = "public" | "followers" | "private";

const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public",
      index: true,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ visibility: 1, createdAt: -1 });
postSchema.index({ viewsCount: -1, createdAt: -1 });

postSchema.pre("save", function updateEditFlag() {
  if (!this.isNew && this.isModified("content")) {
    this.set("isEdited", true);
  }
});

export type Post = InferSchemaType<typeof postSchema> & {
  _id: Types.ObjectId;
};
export type PostModel = Model<Post>;

const PostModel = (models.Post as PostModel) || model<Post>("Post", postSchema);

export default PostModel;
