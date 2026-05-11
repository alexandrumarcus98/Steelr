import "dotenv/config";

import { UserModel, OTPModel } from "@/models";

import { generateOTP, sendOTPEmail } from "@/config/mailer";

type GenerateOTPResult =
	| { emailSent: false }
	| { emailSent: true; expiresAt: Date; reused?: boolean };

const generateAndSendOTP = async (
	email: string,
): Promise<GenerateOTPResult> => {
	if (!email) {
		throw new Error("email is required");
	}

	const normalizedEmail = email.toLowerCase().trim();
	const user = await UserModel.findOne({
		email: normalizedEmail,
	}).exec();

	if (!user) {
		return { emailSent: false };
	}

	const activeOTP = await OTPModel.findOne({
		email: normalizedEmail,
		expiresAt: { $gt: new Date() },
	})
		.sort({ createdAt: -1 })
		.exec();

	if (activeOTP) {
		return { emailSent: true, expiresAt: activeOTP.expiresAt, reused: true };
	}

	await OTPModel.deleteMany({
		email: normalizedEmail,
		expiresAt: { $lte: new Date() },
	});

	const otp = generateOTP();

	if (process.env.OTP_EXPIRES_IN === undefined) {
		throw new Error("OTP_EXPIRES_IN is not defined in environment variables.");
	}

	const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_IN));

	try {
		const savedOTP = await OTPModel.create({
			email: user.email,
			otp,
			expiresAt,
		});
		await savedOTP.save();
	} catch (error) {
		throw error;
	}

	await sendOTPEmail({
		to: user.email,
		username: user.username,
		otp,
	});

	return { emailSent: true, expiresAt };
};

const getRecordByEmailAndOTP = async (
	email: string,
	otp: string,
): Promise<{ isValid: boolean }> => {
	if (!email || !otp) {
		throw new Error("email and otp are required");
	}

	const normalizedEmail = email.toLowerCase().trim();
	const trimmedOtp = otp.trim();

	const otpRecord = await OTPModel.findOne({
		email: normalizedEmail,
		otp: trimmedOtp,
		expiresAt: { $gt: new Date() },
	}).exec();

	if (!otpRecord) {
		return { isValid: false };
	}

	await OTPModel.deleteOne({ _id: otpRecord._id });

	return { isValid: true };
};

export const otpService = {
	generateAndSendOTP,
	getRecordByEmailAndOTP,
};
