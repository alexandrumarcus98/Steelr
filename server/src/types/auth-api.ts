import type { UserRole } from "@/models";
import type { UserResponse } from "@/types/user";

export interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}

export interface LoginBody {
  email?: string;
  password?: string;
}

export interface ForgotPasswordBody {
  email?: string;
}

export interface ResetPasswordBody {
  token?: string;
  password?: string;
  confirmPassword?: string;
}

export interface AuthPayload {
  sub: string;
  roles: UserRole[];
}

export interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  user: UserResponse;
}

export interface LoginResponse {
  requiresOTP: boolean;
  message: string;
  tempEmail?: string;
  expiresInMinutes?: number;
}

export interface VerifyOTPResponse extends AuthResult {
  refreshToken: string;
  expiresIn: number;
  message: string;
}
