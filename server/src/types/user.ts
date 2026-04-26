import mongoose from "mongoose";
import type { UserRole } from "@/models";

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  roles: UserRole[];
  isVerified: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserEntityLike {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  roles: UserRole[];
  isVerified: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
  password?: string;
}

export interface UserStatusUpdateInput {
  isActive?: boolean;
  isVerified?: boolean;
}

export const toUserResponse = (user: UserEntityLike): UserResponse => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  roles: user.roles,
  isVerified: user.isVerified,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
