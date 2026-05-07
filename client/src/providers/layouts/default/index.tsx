import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/auth";
import { useTheme } from "@/providers/theme";

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

const DefaultLayout: React.FC = () => {
	const { user, logout, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const { theme, toggleTheme } = useTheme();
	const { pathname } = useLocation();
	const authLinkState = { from: pathname };

	const handleLogout = async () => {
		await logout();
		navigate("/");
	};

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
			{/* Navbar */}
			<header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/90">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center">
							<Link
								to="/"
								className="text-lg font-semibold tracking-tight text-slate-900 transition-opacity duration-300 hover:opacity-70 dark:text-slate-100"
							>
								Steelr
							</Link>
						</div>

						<nav className="hidden items-center space-x-2 md:flex">
							<Link
								to="/"
								className="rounded-md px-3 py-2 text-sm text-slate-700 transition-all duration-300 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
							>
								Home
							</Link>
							{isAuthenticated && (
								<>
									<Link
										to="/dashboard"
										className="rounded-md px-3 py-2 text-sm text-slate-700 transition-all duration-300 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
									>
										Dashboard
									</Link>
									<Link
										to="/feed"
										className="rounded-md px-3 py-2 text-sm text-slate-700 transition-all duration-300 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
									>
										Feed
									</Link>
									{user?.roles?.includes("admin") && (
										<Link
											to="/users"
											className="rounded-md px-3 py-2 text-sm text-slate-700 transition-all duration-300 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
										>
											Users
										</Link>
									)}
									<Link
										to="/profile"
										className="rounded-md px-3 py-2 text-sm text-slate-700 transition-all duration-300 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
									>
										Profile
									</Link>
								</>
							)}
						</nav>

						{/* Right side */}
						<div className="flex items-center gap-2">
							{/* Theme toggle */}
								<button
									type="button"
									onClick={toggleTheme}
								aria-label={
									theme === "dark"
										? "Switch to light mode"
										: "Switch to dark mode"
								}
								className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100"
								>
									{theme === "dark" ? <SunIcon /> : <MoonIcon />}
								</button>

							{isAuthenticated ? (
								<div className="flex items-center gap-3">
									<span className="hidden text-sm text-slate-600 dark:text-slate-400 sm:block">
										{user?.username}
									</span>
									<button
										onClick={handleLogout}
										className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
									>
										Logout
									</button>
								</div>
							) : (
								<div className="flex items-center gap-2">
									<Link
										to="/login"
										state={authLinkState}
										className="rounded-md px-3 py-2 text-sm text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100"
									>
										Login
									</Link>
									<Link
										to="/register"
										state={authLinkState}
										className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
									>
										Register
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<Outlet />
			</main>

			{/* Footer */}
			<footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
				<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
					<div className="text-center text-sm text-slate-500 dark:text-slate-400">
						&copy; 2026 Steelr. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	);
};

export default DefaultLayout;
