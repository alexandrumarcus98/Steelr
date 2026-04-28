// src/models/like.model.ts
import { InferSchemaType, Model, Schema, model, models, Types } from "mongoose";

export type LikeTargetType = "post";

const likeSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		targetType: {
			type: String,
			enum: ["post"],
			default: "post",
			required: true,
		},
		targetId: {
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

likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
likeSchema.index({ targetType: 1, targetId: 1 });

export type Like = InferSchemaType<typeof likeSchema> & { _id: Types.ObjectId };

export type LikeModel = Model<Like>;

const LikeModel = (models.Like as LikeModel) || model<Like>("Like", likeSchema);

export default LikeModel;
