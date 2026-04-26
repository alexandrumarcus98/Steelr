import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import api, { setAuthToken } from "../../lib/api";

interface User {
	id: string;
	username: string;
	email: string;
	roles: string[];
	status: string;
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
	login: (data: { email: string; password: string }) => Promise<void>; // Placeholder until backend adds login
	logout: () => void;
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
	const [user, setUser] = useState<User | null>(null);
	const [token, setTokenState] = useState<string | null>(
		localStorage.getItem("authToken"),
	);
	const [loading, setLoading] = useState(true);

	const isAuthenticated = !!token && !!user;

	useEffect(() => {
		const initAuth = async () => {
			if (token) {
				setAuthToken(token);
				try {
					const { data } = await api.get("/auth/me");
					setUser(data);
				} catch (error) {
					// Token invalid, clear it
					setTokenState(null);
					localStorage.removeItem("authToken");
					setAuthToken(null);
				}
			}
			setLoading(false);
		};
		initAuth();
	}, [token]);

	const register = async (data: {
		username: string;
		email: string;
		password: string;
	}) => {
		const { data: response } = await api.post("/auth/register", data);
		const token = response.accessToken;
		setTokenState(token);
		localStorage.setItem("authToken", token);
		setAuthToken(token);
		setUser(response.user);
	};

	const login = async (loginData: { email: string; password: string }) => {
		const { data } = await api.post("/auth/login", loginData);
		const token = data.accessToken;
		setTokenState(token);
		localStorage.setItem("authToken", token);
		setAuthToken(token);
		setUser(data.user);
	};

	const logout = async () => {
		try {
			await api.post("/auth/logout");
		} catch (error) {
			// Ignore logout errors
		}
		setTokenState(null);
		setUser(null);
		localStorage.removeItem("authToken");
		setAuthToken(null);
	};

	const value: AuthContextType = {
		user,
		token,
		isAuthenticated,
		loading,
		register,
		login,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
