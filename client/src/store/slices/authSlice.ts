import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { IUser } from "@/store/types/auth";

import api from "@/lib/api";
import { setAuthToken as setApiToken } from "@/lib/api";
import { normalizeApiError } from "@/lib/apiError";
interface AuthState {
	user: IUser | null;
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: string | null;
	requiresOTP: boolean;
	tempEmail: string | null;
}

const initialState: AuthState = {
	user: null,
	accessToken: localStorage.getItem("accessToken") || null,
	refreshToken: localStorage.getItem("refreshToken") || null,
	isAuthenticated: !!localStorage.getItem("accessToken"),
	loading: false,
	error: null,
	requiresOTP: false,
	tempEmail: null,
};

// Thunks
export const loginThunk = createAsyncThunk(
	"auth/login",
	async (credentials: { email: string; password: string }, { rejectWithValue }) => {
		try {
			const response = await api.post("/auth/login", credentials);
			return response.data;
		} catch (err) {
			const { message } = normalizeApiError(err, "Registration failed. Please try again.");
			return rejectWithValue(message);
		}
	},
);

export const generateOTPThunk = createAsyncThunk(
	"auth/generateOTP",
	async (email: string, { rejectWithValue }) => {
		try {
			const response = await api.post("/auth/generate-otp", { email });
			return response.data;
		} catch (err) {
			const { message } = normalizeApiError(err, "Registration failed. Please try again.");
			return rejectWithValue(message);
		}
	},
);

export const verifyOTPThunk = createAsyncThunk(
	"auth/verifyOTP",
	async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
		try {
			const response = await api.post("/auth/verify-otp", { email, otp });
			return response.data;
		} catch (err) {
			const { message } = normalizeApiError(err, "Registration failed. Please try again.");
			return rejectWithValue(message);
		}
	},
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
	try {
		await api.post("/auth/logout");
	} catch (err) {
		const { message } = normalizeApiError(err, "Registration failed. Please try again.");
		return message;
	}
});

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<IUser | null>) => {
			state.user = action.payload;
			state.isAuthenticated = !!action.payload;
		},
		setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
			const { accessToken, refreshToken } = action.payload;
			state.accessToken = accessToken;
			state.refreshToken = refreshToken;
			state.isAuthenticated = true;
			state.requiresOTP = false;
			state.tempEmail = null;
			localStorage.setItem("accessToken", accessToken);
			localStorage.setItem("refreshToken", refreshToken);
			setApiToken(accessToken);
		},
		clearAuth: (state) => {
			state.user = null;
			state.accessToken = null;
			state.refreshToken = null;
			state.isAuthenticated = false;
			state.requiresOTP = false;
			state.tempEmail = null;
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			setApiToken(null);
		},
		setRequiresOTP: (state, action: PayloadAction<string>) => {
			state.requiresOTP = true;
			state.tempEmail = action.payload;
		},
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Login
			.addCase(loginThunk.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(loginThunk.fulfilled, (state, action) => {
				state.loading = false;
				state.error = null;
				if (action.payload.requiresOTP) {
					state.requiresOTP = true;
					state.tempEmail = action.payload.tempEmail || action.meta.arg.email;
				}
			})
			.addCase(loginThunk.rejected, (state, action) => {
				state.loading = false;
				state.error = (action.payload as string) || "Login failed";
			})
			// Verify OTP
			.addCase(verifyOTPThunk.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(verifyOTPThunk.fulfilled, (state, action) => {
				state.loading = false;
				state.isAuthenticated = true;
				state.requiresOTP = false;
				state.tempEmail = null;
				if (action.payload.accessToken && action.payload.refreshToken) {
					state.accessToken = action.payload.accessToken;
					state.refreshToken = action.payload.refreshToken;
					state.user = action.payload.user;
					localStorage.setItem("accessToken", action.payload.accessToken);
					localStorage.setItem("refreshToken", action.payload.refreshToken);
					setApiToken(action.payload.accessToken);
				}
			})
			.addCase(verifyOTPThunk.rejected, (state, action) => {
				state.loading = false;
				state.error = (action.payload as string) || "OTP verification failed";
			})
			// Logout
			.addCase(logoutThunk.fulfilled, (state) => {
				state.user = null;
				state.accessToken = null;
				state.refreshToken = null;
				state.isAuthenticated = false;
				state.requiresOTP = false;
				state.tempEmail = null;
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				setApiToken(null);
			});
	},
});

export const { setUser, setTokens, clearAuth, setRequiresOTP, clearError } = authSlice.actions;

export default authSlice.reducer;
