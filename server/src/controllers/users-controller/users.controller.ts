import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@/models";
import { toUserResponse } from "@/types/user";
import * as usersService from "@/services/users-service/users.service";

export const me = async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const user = await usersService.findCurrentUser(req.user?.id);

		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.status(200).json({ user: toUserResponse(user) });
	} catch {
		res.status(500).json({ message: "Failed to fetch current user" });
	}
};

export const getUsers = async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const page = Math.max(Number(req.query.page) || 1, 1);
		const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
		const { users, total } = await usersService.findUsers(page, limit);

		res.status(200).json({
			data: users.map((user) => toUserResponse(user)),
			meta: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch {
		res.status(500).json({ message: "Failed to fetch users" });
	}
};

export const getUser = async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const user = await usersService.findUserById(req.params.id);

		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.status(200).json({ user: toUserResponse(user) });
	} catch {
		res.status(400).json({ message: "Invalid user id" });
	}
};

export const updateUser = async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const user = await usersService.updateUserById(req.params.id, req.body);

		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.status(200).json({ user: toUserResponse(user) });
	} catch (error) {
		if (
			error instanceof Error &&
			(error.message === "password must be at least 8 characters" ||
				error.message === "No valid fields to update")
		) {
			res.status(400).json({ message: error.message });
			return;
		}

		if (usersService.isDuplicateKeyError(error)) {
			res.status(409).json({ message: "username or email already exists" });
			return;
		}

		if (usersService.isValidationError(error)) {
			res.status(400).json({ message: (error as Error).message });
			return;
		}

		res.status(400).json({ message: "Failed to update user" });
	}
};

export const updateRoles = async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const roles = (req.body as { roles?: UserRole[] }).roles;
		const user = await usersService.updateUserRoles(req.params.id, roles);

		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.status(200).json({ user: toUserResponse(user) });
	} catch (error) {
		if (
			error instanceof Error &&
			(error.message === "roles array is required" || error.message === "Invalid roles provided")
		) {
			res.status(400).json({ message: error.message });
			return;
		}

		res.status(400).json({ message: "Failed to update user roles" });
	}
};

export const updateStatus = async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const user = await usersService.updateUserStatus(req.params.id, req.body);

		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.status(200).json({ user: toUserResponse(user) });
	} catch (error) {
		if (error instanceof Error && error.message === "isActive or isVerified boolean is required") {
			res.status(400).json({ message: error.message });
			return;
		}

		res.status(400).json({ message: "Failed to update user status" });
	}
};

export const deleteUser = async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const user = await usersService.deleteUserById(req.params.id);

		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.status(200).json({ message: "User deleted" });
	} catch {
		res.status(400).json({ message: "Failed to delete user" });
	}
};
