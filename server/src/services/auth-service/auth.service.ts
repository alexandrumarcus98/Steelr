import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import "dotenv/config";

import { getPasswordResetUrl, sendPasswordResetEmail } from "@/config/mailer";
import { UserModel, type UserRole } from "@/models";
import type {
	AuthPayload,
	AuthResult,
	ForgotPasswordBody,
	LoginBody,
	RegisterBody,
	ResetPasswordBody,
} from "@/types/auth-api";
import { toUserResponse } from "@/types/user";
import { isDuplicateKeyError, isValidationError } from "@/utils/errors";
export { isDuplicateKeyError, isValidationError };

import type { SignOptions } from "jsonwebtoken";

const SALT_ROUNDS = 12;
const RESET_TOKEN_EXPIRES_IN_MS = 15 * 60 * 1000;

const getAccessTokenSecret = (): string => {
	const secret = process.env.JWT_ACCESS_SECRET;

	if (!secret) {
		throw new Error("Missing JWT_ACCESS_SECRET environment variable");
	}

	return secret;
};

export const signAccessToken = (payload: AuthPayload): string => {
	const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ||
		"1h") as SignOptions["expiresIn"];

	return jwt.sign(payload, getAccessTokenSecret(), {
		expiresIn,
	});
};

const hashResetToken = (token: string): string => {
	return crypto.createHash("sha256").update(token).digest("hex");
};

const createResetToken = (): string => {
	return crypto.randomBytes(32).toString("hex");
};

const getRefreshTokenSecret = (): string => {
	const secret = process.env.JWT_REFRESH_SECRET;

	if (!secret) {
		throw new Error("Missing JWT_REFRESH_SECRET environment variable");
	}

	return secret;
};

const signRefreshToken = (payload: AuthPayload): string => {
	const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ||
		"7d") as SignOptions["expiresIn"];

	return jwt.sign(payload, getRefreshTokenSecret(), {
		expiresIn,
	});
};

export { signRefreshToken };

export const registerUser = async (body: RegisterBody): Promise<AuthResult> => {
	const { username, email, password } = body;

	if (!username || !email || !password) {
		throw new Error("username, email and password are required");
	}

	if (password.length < 8) {
		throw new Error("password must be at least 8 characters");
	}

	const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
	const user = await UserModel.create({ username, email, passwordHash });
	const accessToken = signAccessToken({
		sub: user.id,
		roles: user.roles as UserRole[],
	});

	return {
		accessToken,
		user: toUserResponse(user.toObject()),
	};
};

export const validateLoginCredentials = async (
	body: LoginBody,
): Promise<{
	isValid: boolean;
	user: ReturnType<typeof toUserResponse>;
} | null> => {
	const { email, password } = body;

	if (!email || !password) {
		throw new Error("email and password are required");
	}

	const user = await UserModel.findOne({ email: email.toLowerCase().trim() })
		.select(
			"+passwordHash username email roles isVerified isActive createdAt updatedAt",
		)
		.exec();

	if (!user || !user.isActive) {
		return null;
	}

	const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

	if (!isPasswordValid) {
		return null;
	}

	return {
		isValid: true,
		user: toUserResponse(user.toObject()),
	};
};

export const loginUser = async (
	body: LoginBody,
): Promise<AuthResult | null> => {
	const { email, password } = body;

	if (!email || !password) {
		throw new Error("email and password are required");
	}

	const user = await UserModel.findOne({ email: email.toLowerCase().trim() })
		.select(
			"+passwordHash username email roles isVerified isActive createdAt updatedAt",
		)
		.exec();

	if (!user || !user.isActive) {
		return null;
	}

	const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

	if (!isPasswordValid) {
		return null;
	}

	user.lastLoginAt = new Date();
	await user.save();
	const accessToken = signAccessToken({
		sub: user.id,
		roles: user.roles as UserRole[],
	});

	return {
		accessToken,
		user: toUserResponse(user.toObject()),
	};
};

export const createPasswordReset = async (
	body: ForgotPasswordBody,
): Promise<{ emailSent: boolean }> => {
	const { email } = body;

	if (!email) {
		throw new Error("email is required");
	}

	const user = await UserModel.findOne({ email: email.toLowerCase().trim() })
		.select("+resetPasswordTokenHash +resetPasswordExpiresAt")
		.exec();

	if (!user) {
		return { emailSent: false };
	}

	const resetToken = createResetToken();
	user.resetPasswordTokenHash = hashResetToken(resetToken);
	user.resetPasswordExpiresAt = new Date(
		Date.now() + RESET_TOKEN_EXPIRES_IN_MS,
	);
	await user.save();

	const resetUrl = getPasswordResetUrl(resetToken);
	await sendPasswordResetEmail({
		to: user.email,
		username: user.username,
		resetUrl,
	});

	return { emailSent: true };
};

export const resetPassword = async (body: ResetPasswordBody): Promise<void> => {
	const { token, password, confirmPassword } = body;

	if (!token || !password) {
		throw new Error("token and password are required");
	}

	if (confirmPassword !== undefined && confirmPassword !== password) {
		throw new Error("password and confirmPassword must match");
	}

	if (password.length < 8) {
		throw new Error("password must be at least 8 characters");
	}

	const tokenHash = hashResetToken(token);
	const user = await UserModel.findOne({
		resetPasswordTokenHash: tokenHash,
		resetPasswordExpiresAt: { $gt: new Date() },
	})
		.select("+passwordHash +resetPasswordTokenHash +resetPasswordExpiresAt")
		.exec();

	if (!user) {
		throw new Error("Invalid or expired recovery token");
	}

	user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
	user.resetPasswordTokenHash = null;
	user.resetPasswordExpiresAt = null;
	user.lastLoginAt = new Date();
	await user.save();
};

export const getCurrentUser = async (userId?: string) => {
	if (!userId) {
		return null;
	}

	return UserModel.findById(userId)
		.select("username email roles isVerified isActive createdAt updatedAt")
		.lean()
		.exec();
};
