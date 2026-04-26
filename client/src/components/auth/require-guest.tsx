// src/providers/auth/RequireGuest.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/providers/auth";

export const RequireGuest = () => {
	const { user, loading } = useAuth();

	if (loading) return null; // or a spinner

	if (user) {
		// already logged in → send to main page
		return <Navigate to="/" replace />;
	}

	// not logged in → render nested route (Login/Register)
	return <Outlet />;
};
