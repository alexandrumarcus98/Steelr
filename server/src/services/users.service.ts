import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { UserModel, type UserRole } from "@/models";
import type { UserStatusUpdateInput, UserUpdateInput } from "@/types/user";

const SALT_ROUNDS = 12;

export const isDuplicateKeyError = (error: unknown): boolean => {
  return error instanceof mongoose.Error && "code" in error && error.code === 11000;
};

export const isValidationError = (error: unknown): boolean => {
  return error instanceof mongoose.Error.ValidationError;
};

export const findCurrentUser = async (userId?: string) => {
  if (!userId) {
    return null;
  }

  return UserModel.findById(userId)
    .select("username email roles isVerified isActive createdAt updatedAt")
    .lean()
    .exec();
};

export const findUsers = async (page: number, limit: number) => {
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

  return { users, total };
};

export const findUserById = async (id: string) => {
  return UserModel.findById(id)
    .select("username email roles isVerified isActive createdAt updatedAt")
    .lean()
    .exec();
};

export const updateUserById = async (id: string, payload: UserUpdateInput) => {
  const { username, email, password } = payload;
  const updates: Record<string, string> = {};

  if (username) {
    updates.username = username;
  }

  if (email) {
    updates.email = email;
  }

  if (password) {
    if (password.length < 8) {
      throw new Error("password must be at least 8 characters");
    }

    updates.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No valid fields to update");
  }

  return UserModel.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  })
    .select("username email roles isVerified isActive createdAt updatedAt")
    .lean()
    .exec();
};

export const updateUserRoles = async (id: string, roles?: UserRole[]) => {
  if (!Array.isArray(roles) || roles.length === 0) {
    throw new Error("roles array is required");
  }

  const allowedRoles: UserRole[] = ["user", "moderator", "admin"];
  const hasInvalidRole = roles.some((role) => !allowedRoles.includes(role));

  if (hasInvalidRole) {
    throw new Error("Invalid roles provided");
  }

  return UserModel.findByIdAndUpdate(id, { roles }, { new: true, runValidators: true })
    .select("username email roles isVerified isActive createdAt updatedAt")
    .lean()
    .exec();
};

export const updateUserStatus = async (id: string, payload: UserStatusUpdateInput) => {
  const { isActive, isVerified } = payload;

  if (typeof isActive !== "boolean" && typeof isVerified !== "boolean") {
    throw new Error("isActive or isVerified boolean is required");
  }

  const updates: UserStatusUpdateInput = {};

  if (typeof isActive === "boolean") {
    updates.isActive = isActive;
  }

  if (typeof isVerified === "boolean") {
    updates.isVerified = isVerified;
  }

  return UserModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
    .select("username email roles isVerified isActive createdAt updatedAt")
    .lean()
    .exec();
};

export const deleteUserById = async (id: string) => {
  return UserModel.findByIdAndDelete(id).exec();
};
