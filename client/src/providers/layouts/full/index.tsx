import React from "react";

import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useTheme } from "@/hooks/useTheme";

import MoonIcon from "@/components/custom-components/moon-icon";
import SunIcon from "@/components/custom-components/sun-icon";

const FullLayout: React.FC = () => {
	const navigate = useNavigate();
	const { pathname, state } = useLocation();
	const { theme, toggleTheme } = useTheme();
	const fromPath = (state as { from?: string } | null)?.from;
	const backTarget = fromPath && fromPath.startsWith("/") && fromPath !== pathname ? fromPath : "/";
	const showBackButton =
		pathname === "/login" || pathname === "/register" || pathname === "/recover-password";

	const handleBack = () => {
		navigate(backTarget);
	};

	return (
		<div className="relative mx-auto flex min-h-screen w-full items-center justify-center px-4 py-6 transition-colors duration-200 sm:px-6 lg:px-8 bg-bg">
			<button
				type="button"
				onClick={toggleTheme}
				aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
				className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md transition-all duration-200 sm:right-6 sm:top-6 lg:right-8 lg:top-8 text-muted"
				onMouseEnter={(e) => {
					(e.currentTarget as HTMLElement).style.color = "var(--text)";
					(e.currentTarget as HTMLElement).style.background = "var(--surface)";
				}}
				onMouseLeave={(e) => {
					(e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
					(e.currentTarget as HTMLElement).style.background = "transparent";
				}}
			>
				{theme === "dark" ? <SunIcon /> : <MoonIcon />}
			</button>

			{showBackButton && (
				<button
					type="button"
					onClick={handleBack}
					className="absolute left-4 top-4 inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 sm:left-6 sm:top-6 lg:left-8 lg:top-8 text-muted"
					onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
					onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
				>
					<span aria-hidden="true">←</span>
					{backTarget === "/" ? "Home" : "Back"}
				</button>
			)}

			<div className="w-full">
				<Outlet />
			</div>
		</div>
	);
};

export default FullLayout;
