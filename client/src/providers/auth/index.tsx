import React, { createContext, ReactNode, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	clearAuth,
	generateOTPThunk,
	loginThunk,
	logoutThunk,
	setTokens,
	setUser,
	verifyOTPThunk,
} from "@/store/slices/authSlice";
import api, { setAuthToken } from "@/lib/api";
import { normalizeApiError } from "@/lib/apiError";

import { IUser } from "@/store/types/auth";
interface ILoginResult {
	requiresOTP: boolean;
	message: string;
	tempEmail?: string;
	expiresAt?: string | number;
}

interface IOTPResult {
	message: string;
	reused?: boolean;
	expiresAt?: string | number;
}

interface IAuthContextType {
	user: IUser | null;
	token: string | null;
	isAuthenticated: boolean;
	loading: boolean;
	register: (data: { username: string; email: string; password: string }) => Promise<void>;
	login: (data: { email: string; password: string }) => Promise<ILoginResult>;
	logout: () => Promise<void>;
	generateOTP: (email: string) => Promise<IOTPResult>;
	verifyOTP: (email: string, otp: string) => Promise<void>;
}

const AuthContext = createContext<IAuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const dispatch = useAppDispatch();
	const { user, accessToken, isAuthenticated, loading } = useAppSelector((state) => state.auth);

	useEffect(() => {
		setAuthToken(accessToken);
	}, [accessToken]);

	useEffect(() => {
		if (!accessToken || user) return;

		const bootstrapSession = async (): Promise<void> => {
			try {
				const response = await api.get("/auth/me");
				dispatch(setUser(response.data.user as IUser));
			} catch {
				dispatch(clearAuth());
			}
		};

		void bootstrapSession();
	}, [accessToken, user, dispatch]);

	const register = async (data: { username: string; email: string; password: string }) => {
		try {
			const response = await api.post("/auth/register", data);
			const access = response.data.accessToken as string | undefined;
			const refresh = (response.data.refreshToken as string | undefined) || "";
			const registeredUser = response.data.user as IUser | undefined;
			if (!access || !registeredUser) {
				throw new Error("Registration failed");
			}
			dispatch(setTokens({ accessToken: access, refreshToken: refresh }));
			dispatch(setUser(registeredUser));
		} catch (err) {
			const { message } = normalizeApiError(err, "Registration failed. Please try again.");
			throw new Error(message);
		}
	};

	const login = async (loginData: { email: string; password: string }) => {
		return dispatch(loginThunk(loginData)).unwrap() as Promise<ILoginResult>;
	};

	const logout = async () => {
		await dispatch(logoutThunk()).unwrap();
		dispatch(clearAuth());
	};

	const generateOTP = async (email: string) => {
		return dispatch(generateOTPThunk(email)).unwrap() as Promise<IOTPResult>;
	};

	const verifyOTP = async (email: string, otp: string) => {
		await dispatch(verifyOTPThunk({ email, otp })).unwrap();
	};

	const value: IAuthContextType = {
		user,
		token: accessToken,
		isAuthenticated,
		loading,
		register,
		login,
		logout,
		generateOTP,
		verifyOTP,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
