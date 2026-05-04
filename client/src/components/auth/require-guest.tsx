import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/providers/auth";

export const RequireGuest = () => {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
					<p className="text-sm font-medium text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	if (isAuthenticated) {
		// already logged in → send to main page
		return <Navigate to="/" />;
	}

	// not logged in → render nested route (Login/Register)
	return <Outlet />;
};
