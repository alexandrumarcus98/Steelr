import "dotenv/config";
import { UserModel, OTPModel } from "@/models";

import { generateOTP, sendOTPEmail } from "@/config/mailer";

export const generateAndSendOTP = async (
	email: string,
): Promise<{ emailSent: boolean; expiresAt?: Date }> => {
	if (!email) {
		throw new Error("email is required");
	}

	const normalizedEmail = email.toLowerCase().trim();
	console.log(`[OTP] Generating OTP for email: ${normalizedEmail}`);

	const user = await UserModel.findOne({
		email: normalizedEmail,
	}).exec();

	if (!user) {
		console.log(`[OTP] User not found for email: ${normalizedEmail}`);
		return { emailSent: false };
	}

	// Delete all previous OTPs for this user
	console.log(`[OTP] Deleting previous OTPs for user`);
	await OTPModel.deleteMany({ email: normalizedEmail });

	const otp = generateOTP();
	console.log(`[OTP] Generated OTP: ${otp} for user: ${user.email}`);

	if (process.env.OTP_EXPIRES_IN === undefined) {
		throw new Error("OTP_EXPIRES_IN is not defined in environment variables.");
	}

	const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_IN));
	console.log(`[OTP] OTP expires at: ${expiresAt.toISOString()}`);

	try {
		const savedOTP = await OTPModel.create({
			email: user.email,
			otp,
			expiresAt,
		});
		console.log(`[OTP] OTP saved to DB with ID: ${savedOTP._id}`);
	} catch (error) {
		console.error(`[OTP] Error saving OTP to database:`, error);
		throw error;
	}

	await sendOTPEmail({
		to: user.email,
		username: user.username,
		otp,
	});

	return { emailSent: true, expiresAt }; // ← Return expiresAt
};

export const getRecordByEmailAndOTP = async (
	email: string,
	otp: string,
): Promise<{ isValid: boolean }> => {
	if (!email || !otp) {
		throw new Error("email and otp are required");
	}

	const normalizedEmail = email.toLowerCase().trim();
	const trimmedOtp = otp.trim();

	console.log(
		`[OTP Verify] Looking for OTP with email: ${normalizedEmail}, otp: ${trimmedOtp}`,
	);
	console.log(`[OTP Verify] Current time: ${new Date().toISOString()}`);

	// First, let's see all OTPs for this email (regardless of expiration)
	const allOtpsForEmail = await OTPModel.find({
		email: normalizedEmail,
	}).exec();
	console.log(
		`[OTP Verify] Found ${allOtpsForEmail.length} OTP records for email: ${normalizedEmail}`,
	);

	allOtpsForEmail.forEach((record, index) => {
		console.log(
			`[OTP Verify] Record ${index + 1}: otp="${record.otp}", expiresAt="${record.expiresAt?.toISOString()}", expired=${new Date() > (record.expiresAt || new Date())}`,
		);
	});

	// Now search with all filters
	const otpRecord = await OTPModel.findOne({
		email: normalizedEmail,
		otp: trimmedOtp,
		expiresAt: { $gt: new Date() },
	}).exec();

	console.log(
		`[OTP Verify] Search result: ${otpRecord ? "Found" : "Not found"}`,
	);

	if (!otpRecord) {
		// Try to find without expiration check to see what's the issue
		const recordWithoutExpiry = await OTPModel.findOne({
			email: normalizedEmail,
			otp: trimmedOtp,
		}).exec();

		if (recordWithoutExpiry) {
			console.log(
				`[OTP Verify] Record exists but is EXPIRED. ExpiresAt: ${recordWithoutExpiry.expiresAt?.toISOString()}`,
			);
		} else {
			console.log(`[OTP Verify] No record found even without expiry check`);
		}

		return { isValid: false };
	}

	console.log(`[OTP Verify] OTP verified successfully, deleting record`);
	await OTPModel.deleteOne({ _id: otpRecord._id });

	return { isValid: true };
};
