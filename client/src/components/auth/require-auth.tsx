import React from "react";

import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

const RequireAuth: React.FC = () => {
	const { isAuthenticated, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
				Checking session...
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return <Outlet />;
};

export default RequireAuth;
