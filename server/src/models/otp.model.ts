import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const otpSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		otp: {
			type: String,
			required: true,
			trim: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

otpSchema.set("toJSON", {
	transform: (_doc, ret) => {
		return ret;
	},
});

export type OTP = InferSchemaType<typeof otpSchema>;
export type OTPModel = Model<OTP>;

const OTPModel = (models.OTP as OTPModel) || model<OTP>("OTP", otpSchema);

export default OTPModel;
