import { InferSchemaType, Model, Schema, model, models, Types } from "mongoose";

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
		content: {
			type: String,
			required: true,
			trim: true,
			maxlength: 1000,
		},
		isEdited: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

commentSchema.pre("save", function markEditedFlag() {
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
