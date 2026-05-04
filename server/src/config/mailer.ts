import "dotenv/config";
import nodemailer from "nodemailer";

const getFrontendUrl = (): string => {
	const frontendUrl = process.env.FRONTEND_URL;

	if (!frontendUrl) {
		throw new Error("Missing FRONTEND_URL environment variable");
	}

	return frontendUrl.replace(/\/$/, "");
};

const createTransporter = () => {
	const host = process.env.SMTP_HOST || "smtp.gmail.com";
	const port = Number(process.env.SMTP_PORT || 587);
	const user = process.env.GMAIL_EMAIL;
	const pass = process.env.GMAIL_PASSWORD;

	return nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		auth: user && pass ? { user, pass } : undefined,
	});
};

export const getPasswordResetUrl = (token: string): string => {
	return `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;
};

export const sendPasswordResetEmail = async (params: {
	to: string;
	username: string;
	resetUrl: string;
}): Promise<void> => {
	try {
		const transporter = createTransporter();
		const fromAddress = process.env.GMAIL_EMAIL || "no-reply@steelr.com";
		const subject = "Reset your password";
		const text = [
			`Hello ${params.username},`,
			"",
			"We received a request to reset your password.",
			`Reset your password here: ${params.resetUrl}`,
			"",
			"If you did not request this, you can ignore this email.",
		].join("\n");

		if (!transporter) {
			console.log("Password reset email fallback (no SMTP configured):");
			console.log({
				to: params.to,
				from: fromAddress,
				subject,
				text,
			});
			return;
		}

		await transporter.sendMail({
			from: fromAddress,
			to: params.to,
			subject,
			text,
			html: `
				<p>Hello ${params.username},</p>
				<p>We received a request to reset your password.</p>
				<p><a href="${params.resetUrl}">Click here to reset your password</a></p>
				<p>If you did not request this, you can ignore this email.</p>
			`,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error(
			`Failed to send password reset email to ${params.to}: ${errorMessage}`,
		);
		throw new Error(`Failed to send password reset email: ${errorMessage}`);
	}
};

export const generateOTP = (): string => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (params: {
	to: string;
	username: string;
	otp: string;
}): Promise<void> => {
	try {
		const transporter = createTransporter();
		const fromAddress = process.env.GMAIL_EMAIL || "no-reply@steelr.com";
		const subject = "Your OTP for login";
		const text = [
			`Hello ${params.username},`,
			"",
			`Your OTP for login is: ${params.otp}`,
			"",
			"This OTP is valid for 10 minutes.",
			"If you did not request this, you can ignore this email.",
		].join("\n");

		if (!transporter) {
			console.log("OTP email fallback (no SMTP configured):");
			console.log({
				to: params.to,
				from: fromAddress,
				subject,
				text,
			});
			return;
		}

		await transporter.sendMail({
			from: fromAddress,
			to: params.to,
			subject,
			text,
			html: `
				<p>Hello ${params.username},</p>
				<p>Your OTP for login is: <strong>${params.otp}</strong></p>
				<p>This OTP is valid for 10 minutes.</p>
				<p>If you did not request this, you can ignore this email.</p>
			`,
		});

		console.log(`OTP email sent successfully to ${params.to}`);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error(`Failed to send OTP email to ${params.to}: ${errorMessage}`);
		throw new Error(`Failed to send OTP email: ${errorMessage}`);
	}
};
