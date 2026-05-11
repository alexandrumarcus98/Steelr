export interface IUserLocation {
	city?: string;
	country?: string;
	region?: string;
	continent?: string;
	source?: "manual" | "signup-ip" | "seed";
}

export interface IUser {
	id: string;
	username: string;
	email: string;
	roles: string[];
	isActive: boolean;
	isVerified: boolean;
	location?: IUserLocation;
	friendsCount: number;
}

export interface IAuthTokens {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

export interface IVerifyOTPResponse {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
	user: IUser;
}

export interface ILoginResponse {
	requiresOTP: boolean;
	message: string;
	tempEmail?: string;
	expiresAt?: number;
}
