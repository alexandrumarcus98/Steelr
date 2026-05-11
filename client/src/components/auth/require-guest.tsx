import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

export const RequireGuest = () => {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return (
			<div className="flex items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-border-soft border-t-cyan"></div>
					<p className="text-sm font-medium text-slate-400">Loading...</p>
				</div>
			</div>
		);
	}

	if (isAuthenticated) {
		return <Navigate to="/" />;
	}

	return <Outlet />;
};
