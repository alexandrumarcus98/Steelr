import type { NextFunction, Request, Response } from "express";
import type {
	ForgotPasswordBody,
	LoginBody,
	RegisterBody,
	ResetPasswordBody,
} from "@/types/auth-api";
import { toUserResponse } from "@/types/user";
import * as authService from "@/services/auth-service/auth.service";
import * as otpService from "@/services/otp-service/otp.service";
import { UserModel } from "@/models";
import {
	signAccessToken,
	signRefreshToken,
} from "@/services/auth-service/auth.service";
import type { UserRole } from "@/models";

export const register = async (
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	try {
		const forwardedFor = req.headers["x-forwarded-for"];
		const forwardedIp =
			typeof forwardedFor === "string" ? forwardedFor.split(",")[0]?.trim() : undefined;
		const signupIp = forwardedIp || req.ip || undefined;

		const result = await authService.registerUser(req.body as RegisterBody, {
			signupIp,
		});
		res.status(201).json(result);
	} catch (error) {
		if (error instanceof Error) {
			if (
				error.message === "username, email and password are required" ||
				error.message === "password must be at least 8 characters"
			) {
				res.status(400).json({ message: error.message });
				return;
			}
		}

		if (authService.isDuplicateKeyError(error)) {
			res.status(409).json({ message: "username or email already exists" });
			return;
		}

		if (authService.isValidationError(error)) {
			res.status(400).json({ message: (error as Error).message });
			return;
		}

		res.status(500).json({ message: "Failed to register user" });
	}
};

export const login = async (
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	try {
		const result = await authService.validateLoginCredentials(
			req.body as LoginBody,
		);

		if (!result) {
			res.status(401).json({ message: "Invalid credentials" });
			return;
		}

		if (result.isValid) {
			const otpResult = await otpService.generateAndSendOTP(result.user.email);

			if (!otpResult.emailSent) {
				res.status(500).json({ message: "Failed to send OTP." });
				return;
			}

			res.status(200).json({
				message: "OTP sent to your email",
				requiresOTP: true,
				tempEmail: result.user.email,
				expiresAt: otpResult.expiresAt,
			});
		} else {
			res.status(401).json({ message: "Invalid credentials" });
		}
	} catch (error) {
		if (
			error instanceof Error &&
			error.message === "email and password are required"
		) {
			res.status(400).json({ message: error.message });
			return;
		}
		console.error(
			"Login error:",
			error instanceof Error ? error.message : error,
		);

		res.status(500).json({ message: "Failed to login" });
	}
};

export const forgotPassword = async (
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	try {
		const result = await authService.createPasswordReset(
			req.body as ForgotPasswordBody,
		);

		if (!result.emailSent) {
			res.status(200).json({
				message: "If the account exists, a recovery link has been generated",
			});
			return;
		}

		res.status(200).json({
			message: "If the account exists, a recovery email has been sent",
			expiresInMinutes: 15,
		});
	} catch (error) {
		if (error instanceof Error && error.message === "email is required") {
			res.status(400).json({ message: error.message });
			return;
		}

		res.status(500).json({ message: "Failed to create recovery token" });
	}
};

export const resetPassword = async (
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	try {
		await authService.resetPassword(req.body as ResetPasswordBody);
		res.status(200).json({ message: "Password reset successful" });
	} catch (error) {
		if (
			error instanceof Error &&
			(error.message === "token and password are required" ||
				error.message === "password and confirmPassword must match" ||
				error.message === "password must be at least 8 characters" ||
				error.message === "Invalid or expired recovery token")
		) {
			res.status(400).json({ message: error.message });
			return;
		}

		res.status(500).json({ message: "Failed to reset password" });
	}
};

export const verifyResetPasswordToken = async (
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	try {
		const token = typeof req.query.token === "string" ? req.query.token : "";

		await authService.verifyResetPasswordToken(token);

		res.status(200).json({ valid: true });
	} catch (error) {
		if (
			error instanceof Error &&
			(error.message === "token is required" ||
				error.message === "Invalid or expired recovery token")
		) {
			res.status(400).json({ message: error.message });
			return;
		}

		res.status(500).json({ message: "Failed to verify reset token" });
	}
};

export const me = async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const user = await authService.getCurrentUser(req.user?.id);

		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.status(200).json({ user: toUserResponse(user) });
	} catch {
		res.status(500).json({ message: "Failed to fetch current user" });
	}
};

export const logout = async (
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	res.status(200).json({ message: "Logged out" });
};

export const generateOTP = async (
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	try {
		const { email } = req.body;

		if (!email) {
			res.status(400).json({ message: "email is required" });
			return;
		}

		const result = await otpService.generateAndSendOTP(email);

		if (!result.emailSent) {
			res.status(200).json({
				message: "If the account exists, an OTP has been generated",
			});
			return;
		}

		res.status(200).json({
			message: "If the account exists, an OTP has been sent",
			expiresAt: result.expiresAt, // ← Add this
		});
	} catch (error) {
		if (error instanceof Error && error.message === "email is required") {
			res.status(400).json({ message: error.message });
			return;
		}

		res.status(500).json({ message: "Failed to generate OTP" });
	}
};

export const verifyOTPStatus = async (
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	try {
		const { email, otp } = req.body;

		if (!email || !otp) {
			res.status(400).json({ message: "email and otp are required" });
			return;
		}

		const result = await otpService.getRecordByEmailAndOTP(email, otp);

		if (!result.isValid) {
			res.status(400).json({ message: "Invalid or expired OTP" });
			return;
		}

		// Generate tokens after successful OTP verification
		const user = await UserModel.findOne({ email: email.toLowerCase().trim() })
			.select("username email roles isVerified isActive profileLocation friendIds signupIp createdAt updatedAt")
			.exec();
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		user.lastLoginAt = new Date();
		await user.save();

		const accessToken = signAccessToken({
			sub: user.id,
			roles: user.roles as UserRole[],
		});

		const refreshToken = signRefreshToken({
			sub: user.id,
			roles: user.roles as UserRole[],
		});

		res.status(200).json({
			message: "OTP verified successfully",
			accessToken,
			refreshToken,
			expiresIn: 900,
			user: toUserResponse(user.toObject()),
		});
	} catch (error) {
		if (
			error instanceof Error &&
			error.message === "email and otp are required"
		) {
			res.status(400).json({ message: error.message });
			return;
		}

		console.error(
			"Verify OTP error:",
			error instanceof Error ? error.message : error,
		);

		res.status(500).json({ message: "Failed to verify OTP" });
	}
};
