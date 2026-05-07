import mongoose from "mongoose";
import type { UserRole } from "@/models";

export interface UserLocation {
  city?: string;
  country?: string;
  region?: string;
  continent?: string;
  source?: "manual" | "signup-ip" | "seed";
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  roles: UserRole[];
  isVerified: boolean;
  isActive: boolean;
  location?: UserLocation;
  friendsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSearchResult extends UserResponse {
  isFriend: boolean;
  distanceLabel: string;
}

export interface UserEntityLike {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  roles: UserRole[];
  isVerified: boolean;
  isActive: boolean;
  profileLocation?: UserLocation | null;
  friendIds?: Array<mongoose.Types.ObjectId | string>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
  password?: string;
  location?: UserLocation;
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
  location: user.profileLocation
    ? {
        city: user.profileLocation.city,
        country: user.profileLocation.country,
        region: user.profileLocation.region,
        continent: user.profileLocation.continent,
        source: user.profileLocation.source,
      }
    : undefined,
  friendsCount: user.friendIds?.length ?? 0,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
