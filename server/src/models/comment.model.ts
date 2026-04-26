import { InferSchemaType, Model, Schema, Types, model, models } from "mongoose";

const commentSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
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

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });

commentSchema.pre("save", function updateEditFlag() {
  if (!this.isNew && this.isModified("content")) {
    this.set("isEdited", true);
  }
});

export type Comment = InferSchemaType<typeof commentSchema> & {
  _id: Types.ObjectId;
};
export type CommentModel = Model<Comment>;

const CommentModel =
  (models.Comment as CommentModel) || model<Comment>("Comment", commentSchema);

export default CommentModel;
