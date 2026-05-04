export interface User {
	id: string;
	username: string;
	email: string;
	roles: string[];
	isActive: boolean;
	isVerified: boolean;
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
