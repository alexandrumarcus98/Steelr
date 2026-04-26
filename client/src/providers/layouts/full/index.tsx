// src/providers/layouts/full/index.tsx
import React from "react";
import { Outlet } from "react-router-dom";

const FullLayout: React.FC = () => {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
			<div className="w-full max-w-md transition-all duration-300">
				<Outlet />
			</div>
		</div>
	);
};

export default FullLayout;
