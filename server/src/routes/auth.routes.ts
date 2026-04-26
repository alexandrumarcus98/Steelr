import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import { authenticate } from "../middleware";
import { UserModel, type UserRole } from "../models";
import { getPasswordResetUrl, sendPasswordResetEmail } from "../config/mailer";

const authRouter = Router();

const SALT_ROUNDS = 12;
const RESET_TOKEN_EXPIRES_IN_MS = 15 * 60 * 1000;

interface UserResponse {
	id: string;
	username: string;
	email: string;
	roles: UserRole[];
	isVerified: boolean;
	isActive: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

const toUserResponse = (user: {
	_id: mongoose.Types.ObjectId;
	username: string;
	email: string;
	roles: UserRole[];
	isVerified: boolean;
	isActive: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}): UserResponse => {
	return {
		id: user._id.toString(),
		username: user.username,
		email: user.email,
		roles: user.roles,
		isVerified: user.isVerified,
		isActive: user.isActive,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
};

const isDuplicateKeyError = (error: unknown): boolean => {
	return (
		error instanceof mongoose.Error &&
		"code" in error &&
		error.code === 11000
	);
};

const getAccessTokenSecret = (): string => {
	const secret = process.env.JWT_ACCESS_SECRET;

	if (!secret) {
		throw new Error("Missing JWT_ACCESS_SECRET environment variable");
	}

	return secret;
};

const signAccessToken = (payload: { sub: string; roles: UserRole[] }): string => {
	const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN || "1h") as SignOptions["expiresIn"];

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

authRouter.post("/register", async (req: Request, res: Response) => {
	try {
		const { username, email, password } = req.body as {
			username?: string;
			email?: string;
			password?: string;
		};

		if (!username || !email || !password) {
			res
				.status(400)
				.json({ message: "username, email and password are required" });
			return;
		}

		if (password.length < 8) {
			res.status(400).json({ message: "password must be at least 8 characters" });
			return;
		}

		const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

		const user = await UserModel.create({
			username,
			email,
			passwordHash,
		});

		const accessToken = signAccessToken({ sub: user.id, roles: user.roles as UserRole[] });

		res.status(201).json({
			accessToken,
			user: toUserResponse(user.toObject()),
		});
	} catch (error) {
		if (isDuplicateKeyError(error)) {
			res.status(409).json({ message: "username or email already exists" });
			return;
		}

		if (error instanceof mongoose.Error.ValidationError) {
			res.status(400).json({ message: error.message });
			return;
		}

		res.status(500).json({ message: "Failed to register user" });
	}
});

authRouter.post("/login", async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body as {
			email?: string;
			password?: string;
		};

		if (!email || !password) {
			res.status(400).json({ message: "email and password are required" });
			return;
		}

		const user = await UserModel.findOne({ email: email.toLowerCase().trim() })
			.select("+passwordHash username email roles isVerified isActive createdAt updatedAt")
			.exec();

		if (!user || !user.isActive) {
			res.status(401).json({ message: "Invalid credentials" });
			return;
		}

		const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

		if (!isPasswordValid) {
			res.status(401).json({ message: "Invalid credentials" });
			return;
		}

		user.lastLoginAt = new Date();
		await user.save();

		const accessToken = signAccessToken({ sub: user.id, roles: user.roles as UserRole[] });

		res.status(200).json({
			accessToken,
			user: toUserResponse(user.toObject()),
		});
	} catch {
		res.status(500).json({ message: "Failed to login" });
	}
});

authRouter.post("/forgot-password", async (req: Request, res: Response) => {
	try {
		const { email } = req.body as { email?: string };

		if (!email) {
			res.status(400).json({ message: "email is required" });
			return;
		}

		const user = await UserModel.findOne({ email: email.toLowerCase().trim() })
			.select("+resetPasswordTokenHash +resetPasswordExpiresAt")
			.exec();

		if (!user) {
			res.status(200).json({
				message: "If the account exists, a recovery link has been generated",
			});
			return;
		}

		const resetToken = createResetToken();
		user.resetPasswordTokenHash = hashResetToken(resetToken);
		user.resetPasswordExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_IN_MS);
		await user.save();

		const resetUrl = getPasswordResetUrl(resetToken);
		await sendPasswordResetEmail({
			to: user.email,
			username: user.username,
			resetUrl,
		});

		res.status(200).json({
			message: "If the account exists, a recovery email has been sent",
			expiresInMinutes: 15,
		});
	} catch {
		res.status(500).json({ message: "Failed to create recovery token" });
	}
});

authRouter.post("/reset-password", async (req: Request, res: Response) => {
	try {
		const { token, password } = req.body as {
			token?: string;
			password?: string;
			confirmPassword?: string;
		};

		if (!token || !password) {
			res.status(400).json({ message: "token and password are required" });
			return;
		}

		if ((req.body as { confirmPassword?: string }).confirmPassword !== undefined) {
			const confirmPassword = (req.body as { confirmPassword?: string }).confirmPassword;

			if (confirmPassword !== password) {
				res.status(400).json({ message: "password and confirmPassword must match" });
				return;
			}
		}

		if (password.length < 8) {
			res.status(400).json({ message: "password must be at least 8 characters" });
			return;
		}

		const tokenHash = hashResetToken(token);
		const user = await UserModel.findOne({
			resetPasswordTokenHash: tokenHash,
			resetPasswordExpiresAt: { $gt: new Date() },
		})
			.select("+passwordHash +resetPasswordTokenHash +resetPasswordExpiresAt")
			.exec();

		if (!user) {
			res.status(400).json({ message: "Invalid or expired recovery token" });
			return;
		}

		user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
		user.resetPasswordTokenHash = null;
		user.resetPasswordExpiresAt = null;
		user.lastLoginAt = new Date();
		await user.save();

		res.status(200).json({ message: "Password reset successful" });
	} catch {
		res.status(500).json({ message: "Failed to reset password" });
	}
});

authRouter.get("/me", authenticate, async (req: Request, res: Response) => {
	try {
		const user = await UserModel.findById(req.user?.id)
			.select("username email roles isVerified isActive createdAt updatedAt")
			.lean()
			.exec();

		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.status(200).json({ user: toUserResponse(user) });
	} catch {
		res.status(500).json({ message: "Failed to fetch current user" });
	}
});

authRouter.post("/logout", authenticate, (_req: Request, res: Response) => {
	res.status(200).json({ message: "Logged out" });
});

export default authRouter;
