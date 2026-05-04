import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	clearAuth,
	setTokens,
	setUser,
	loginThunk,
	logoutThunk,
	verifyOTPThunk,
	generateOTPThunk,
} from "@/store/slices/authSlice";
import type { User } from "@/store/types/auth";
import api, { setAuthToken } from "@/lib/api";

interface LoginResult {
	requiresOTP: boolean;
	message: string;
	tempEmail?: string;
	expiresAt?: string;
}

interface OTPResult {
	expiresAt?: string;
}

interface AuthContextType {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	loading: boolean;
	register: (data: {
		username: string;
		email: string;
		password: string;
	}) => Promise<void>;
	login: (data: { email: string; password: string }) => Promise<LoginResult>;
	logout: () => Promise<void>;
	generateOTP: (email: string) => Promise<OTPResult>;
	verifyOTP: (email: string, otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
};

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const dispatch = useAppDispatch();
	const { user, accessToken, isAuthenticated, loading } = useAppSelector(
		(state) => state.auth
	);

	useEffect(() => {
		setAuthToken(accessToken);
	}, [accessToken]);

	useEffect(() => {
		if (!accessToken || user) {
			return;
		}

		const bootstrapSession = async (): Promise<void> => {
			try {
				const response = await api.get("/auth/me");
				dispatch(setUser(response.data.user as User));
			} catch {
				dispatch(clearAuth());
			}
		};

		void bootstrapSession();
	}, [accessToken, user, dispatch]);

	const register = async (data: {
		username: string;
		email: string;
		password: string;
	}) => {
		const response = await api.post("/auth/register", data);
		const access = response.data.accessToken as string | undefined;
		const refresh = (response.data.refreshToken as string | undefined) || "";
		const registeredUser = response.data.user as User | undefined;

		if (!access || !registeredUser) {
			throw new Error("Registration failed");
		}

		dispatch(setTokens({ accessToken: access, refreshToken: refresh }));
		dispatch(setUser(registeredUser));
	};

	const login = async (loginData: { email: string; password: string }) => {
		return dispatch(loginThunk(loginData)).unwrap() as Promise<LoginResult>;
	};

	const logout = async () => {
		await dispatch(logoutThunk()).unwrap();
		dispatch(clearAuth());
	};

	const generateOTP = async (email: string) => {
		return dispatch(generateOTPThunk(email)).unwrap() as Promise<OTPResult>;
	};

	const verifyOTP = async (email: string, otp: string) => {
		await dispatch(verifyOTPThunk({ email, otp })).unwrap();
	};

	const value: AuthContextType = {
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
