import { InferSchemaType, Model, Schema, model, models } from "mongoose";

export type UserRole = "user" | "moderator" | "admin";

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			maxlength: 30,
			lowercase: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true,
		},
		passwordHash: {
			type: String,
			required: true,
			select: false,
		},
		roles: {
			type: [String],
			enum: ["user", "moderator", "admin"],
			default: ["user"],
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		lastLoginAt: {
			type: Date,
			default: null,
		},
		resetPasswordTokenHash: {
			type: String,
			select: false,
			default: null,
		},
		resetPasswordExpiresAt: {
			type: Date,
			select: false,
			default: null,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

userSchema.set("toJSON", {
	transform: (_doc, ret) => {
		if ("passwordHash" in ret) {
			delete (ret as Record<string, unknown>).passwordHash;
		}

		return ret;
	},
});

export type User = InferSchemaType<typeof userSchema>;
export type UserModel = Model<User>;

const UserModel = (models.User as UserModel) || model<User>("User", userSchema);

export default UserModel;
