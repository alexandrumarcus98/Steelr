import { InferSchemaType, Model, Schema, Types, model, models } from "mongoose";

const viewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for finding user's last viewed posts (sorted by most recent visit)
viewSchema.index({ user: 1, updatedAt: -1 });
// Index for counting views per post
viewSchema.index({ post: 1 });
// Unique index to prevent duplicate views from same user on same post
viewSchema.index({ user: 1, post: 1 }, { unique: true, sparse: true });

export type View = InferSchemaType<typeof viewSchema> & {
  _id: Types.ObjectId;
};
export type ViewModel = Model<View>;

const ViewModel = (models.View as ViewModel) || model<View>("View", viewSchema);

export default ViewModel;
