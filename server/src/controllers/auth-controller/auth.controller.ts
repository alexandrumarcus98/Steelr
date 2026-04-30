import type { NextFunction, Request, Response } from "express";
import type {
	ForgotPasswordBody,
	LoginBody,
	RegisterBody,
	ResetPasswordBody,
} from "@/types/auth-api";
import { toUserResponse } from "@/types/user";
import * as authService from "@/services/auth-service/auth.service";

export const register = async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = await authService.registerUser(req.body as RegisterBody);
		res.status(201).json(result);
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === "username, email and password are required" || error.message === "password must be at least 8 characters") {
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

export const login = async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = await authService.loginUser(req.body as LoginBody);

		if (!result) {
			res.status(401).json({ message: "Invalid credentials" });
			return;
		}

		res.status(200).json(result);
	} catch (error) {
		if (error instanceof Error && error.message === "email and password are required") {
			res.status(400).json({ message: error.message });
			return;
		}

		res.status(500).json({ message: "Failed to login" });
	}
};

export const forgotPassword = async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = await authService.createPasswordReset(req.body as ForgotPasswordBody);

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

export const resetPassword = async (req: Request, res: Response, _next: NextFunction) => {
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

export const logout = async (_req: Request, res: Response, _next: NextFunction) => {
	res.status(200).json({ message: "Logged out" });
};
