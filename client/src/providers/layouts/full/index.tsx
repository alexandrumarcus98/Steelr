// src/providers/layouts/full/index.tsx
import React from "react";
import { Outlet } from "react-router-dom";

const FullLayout: React.FC = () => {
	return (
		<div className="flex flex-col min-h-screen">
			{/* Main Content */}
			<main className="flex-1">
				<Outlet />
			</main>
		</div>
	);
};

export default FullLayout;
