import bcrypt from "bcryptjs";
import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import { authenticate, requireOwnership, requireRoles } from "../middleware";
import { UserModel, type UserRole } from "../models";

const usersRouter = Router();

const SALT_ROUNDS = 12;

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

usersRouter.get("/me", authenticate, async (req: Request, res: Response) => {
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

usersRouter.get(
	"/",
	authenticate,
	requireRoles("admin", "moderator"),
	async (req: Request, res: Response) => {
		try {
			const page = Math.max(Number(req.query.page) || 1, 1);
			const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
			const skip = (page - 1) * limit;

			const [users, total] = await Promise.all([
				UserModel.find()
					.select("username email roles isVerified isActive createdAt updatedAt")
					.sort({ createdAt: -1 })
					.skip(skip)
					.limit(limit)
					.lean()
					.exec(),
				UserModel.countDocuments(),
			]);

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
	}
);

usersRouter.get(
	"/:id",
	authenticate,
	requireOwnership((req) => req.params.id),
	async (req: Request, res: Response) => {
		try {
			const user = await UserModel.findById(req.params.id)
				.select("username email roles isVerified isActive createdAt updatedAt")
				.lean()
				.exec();

			if (!user) {
				res.status(404).json({ message: "User not found" });
				return;
			}

			res.status(200).json({ user: toUserResponse(user) });
		} catch {
			res.status(400).json({ message: "Invalid user id" });
		}
	}
);

usersRouter.patch(
	"/:id",
	authenticate,
	requireOwnership((req) => req.params.id),
	async (req: Request, res: Response) => {
		try {
			const { username, email, password } = req.body as {
				username?: string;
				email?: string;
				password?: string;
			};

			const updates: Record<string, string> = {};

			if (username) {
				updates.username = username;
			}

			if (email) {
				updates.email = email;
			}

			if (password) {
				if (password.length < 8) {
					res
						.status(400)
						.json({ message: "password must be at least 8 characters" });
					return;
				}

				updates.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
			}

			if (Object.keys(updates).length === 0) {
				res.status(400).json({ message: "No valid fields to update" });
				return;
			}

			const user = await UserModel.findByIdAndUpdate(req.params.id, updates, {
				new: true,
				runValidators: true,
			})
				.select("username email roles isVerified isActive createdAt updatedAt")
				.lean()
				.exec();

			if (!user) {
				res.status(404).json({ message: "User not found" });
				return;
			}

			res.status(200).json({ user: toUserResponse(user) });
		} catch (error) {
			if (isDuplicateKeyError(error)) {
				res.status(409).json({ message: "username or email already exists" });
				return;
			}

			if (error instanceof mongoose.Error.ValidationError) {
				res.status(400).json({ message: error.message });
				return;
			}

			res.status(400).json({ message: "Failed to update user" });
		}
	}
);

usersRouter.patch(
	"/:id/roles",
	authenticate,
	requireRoles("admin"),
	async (req: Request, res: Response) => {
		try {
			const { roles } = req.body as { roles?: UserRole[] };

			if (!Array.isArray(roles) || roles.length === 0) {
				res.status(400).json({ message: "roles array is required" });
				return;
			}

			const allowedRoles: UserRole[] = ["user", "moderator", "admin"];
			const hasInvalidRole = roles.some((role) => !allowedRoles.includes(role));

			if (hasInvalidRole) {
				res.status(400).json({ message: "Invalid roles provided" });
				return;
			}

			const user = await UserModel.findByIdAndUpdate(
				req.params.id,
				{ roles },
				{ new: true, runValidators: true }
			)
				.select("username email roles isVerified isActive createdAt updatedAt")
				.lean()
				.exec();

			if (!user) {
				res.status(404).json({ message: "User not found" });
				return;
			}

			res.status(200).json({ user: toUserResponse(user) });
		} catch {
			res.status(400).json({ message: "Failed to update user roles" });
		}
	}
);

usersRouter.patch(
	"/:id/status",
	authenticate,
	requireRoles("admin"),
	async (req: Request, res: Response) => {
		try {
			const { isActive, isVerified } = req.body as {
				isActive?: boolean;
				isVerified?: boolean;
			};

			if (typeof isActive !== "boolean" && typeof isVerified !== "boolean") {
				res
					.status(400)
					.json({ message: "isActive or isVerified boolean is required" });
				return;
			}

			const updates: { isActive?: boolean; isVerified?: boolean } = {};

			if (typeof isActive === "boolean") {
				updates.isActive = isActive;
			}

			if (typeof isVerified === "boolean") {
				updates.isVerified = isVerified;
			}

			const user = await UserModel.findByIdAndUpdate(req.params.id, updates, {
				new: true,
				runValidators: true,
			})
				.select("username email roles isVerified isActive createdAt updatedAt")
				.lean()
				.exec();

			if (!user) {
				res.status(404).json({ message: "User not found" });
				return;
			}

			res.status(200).json({ user: toUserResponse(user) });
		} catch {
			res.status(400).json({ message: "Failed to update user status" });
		}
	}
);

usersRouter.delete(
	"/:id",
	authenticate,
	requireOwnership((req) => req.params.id, { bypassRoles: ["admin"] }),
	async (req: Request, res: Response) => {
		try {
			const user = await UserModel.findByIdAndDelete(req.params.id).exec();

			if (!user) {
				res.status(404).json({ message: "User not found" });
				return;
			}

			res.status(200).json({ message: "User deleted" });
		} catch {
			res.status(400).json({ message: "Failed to delete user" });
		}
	}
);

export default usersRouter;
