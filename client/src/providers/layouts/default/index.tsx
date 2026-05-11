import React from "react";

import { Outlet } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

import FooterCompoent from "@/components/footer";
import HeaderComponent from "@/components/header";

const DefaultLayout: React.FC = () => {
	const { user, logout, isAuthenticated } = useAuth();
	const { theme, toggleTheme } = useTheme();

	return (
		<div className="min-h-screen">
			<HeaderComponent
				isAuthenticated={isAuthenticated}
				user={user}
				logout={logout}
				theme={theme}
				toggleTheme={toggleTheme}
			/>

			<main className="mx-auto container">
				<Outlet />
			</main>

			<FooterCompoent />
		</div>
	);
};

export default DefaultLayout;
