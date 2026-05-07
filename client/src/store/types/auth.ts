export interface UserLocation {
	city?: string;
	country?: string;
	region?: string;
	continent?: string;
	source?: "manual" | "signup-ip" | "seed";
}

export interface User {
	id: string;
	username: string;
	email: string;
	roles: string[];
	isActive: boolean;
	isVerified: boolean;
	location?: UserLocation;
	friendsCount: number;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

export interface VerifyOTPResponse {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
	user: User;
}

export interface LoginResponse {
	requiresOTP: boolean;
	message: string;
	tempEmail?: string;
	expiresAt?: number;
}
