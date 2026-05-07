import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/providers/theme";

const FullLayout: React.FC = () => {
	const navigate = useNavigate();
	const { pathname, state } = useLocation();
	const { theme, toggleTheme } = useTheme();
	const fromPath = (state as { from?: string } | null)?.from;
	const backTarget =
		fromPath && fromPath.startsWith("/") && fromPath !== pathname
			? fromPath
			: "/";
	const showBackButton =
		pathname === "/login" ||
		pathname === "/register" ||
		pathname === "/recover-password";

	const handleBack = () => {
		navigate(backTarget);
	};

	const SunIcon = () => (
		<svg
			className="h-4 w-4"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.8}
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
			/>
		</svg>
	);

	const MoonIcon = () => (
		<svg
			className="h-4 w-4"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.8}
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
			/>
		</svg>
	);

	return (
		<div className="relative mx-auto flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-6 transition-colors duration-200 dark:bg-slate-950 sm:px-6 lg:px-8">
			{/* Theme toggle — top right */}
			<button
				type="button"
				onClick={toggleTheme}
				aria-label={
					theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
				}
				className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-300 sm:right-6 sm:top-6 lg:right-8 lg:top-8"
			>
				{theme === "dark" ? <SunIcon /> : <MoonIcon />}
			</button>

			{showBackButton && (
				<button
					type="button"
					onClick={handleBack}
					className="absolute left-4 top-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 sm:left-6 sm:top-6 lg:left-8 lg:top-8"
				>
					<span aria-hidden="true">←</span>
					{backTarget === "/" ? "Home" : "Back"}
				</button>
			)}

			<div className="w-full transition-all duration-300">
				<Outlet />
			</div>
		</div>
	);
};

export default FullLayout;
