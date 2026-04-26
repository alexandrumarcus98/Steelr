import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/auth";

const DefaultLayout: React.FC = () => {
	const { user, logout, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		await logout();
		navigate("/");
	};

	return (
		<div className="min-h-screen bg-gray-50 text-gray-900">
			{/* Navbar */}
			<header className="border-b border-gray-200 bg-white/90 backdrop-blur-sm">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center">
							<Link
								to="/"
								className="text-lg font-semibold tracking-tight text-gray-900 transition-opacity duration-300 hover:opacity-70"
							>
								Steelr
							</Link>
						</div>

						<nav className="hidden items-center space-x-2 md:flex">
							<Link
								to="/"
								className="rounded-md px-3 py-2 text-sm text-gray-700 transition-all duration-300 hover:bg-gray-100"
							>
								Home
							</Link>
							{isAuthenticated && (
								<>
									<Link
										to="/dashboard"
										className="rounded-md px-3 py-2 text-sm text-gray-700 transition-all duration-300 hover:bg-gray-100"
									>
										Dashboard
									</Link>
									<Link
										to="/feed"
										className="rounded-md px-3 py-2 text-sm text-gray-700 transition-all duration-300 hover:bg-gray-100"
									>
										Feed
									</Link>
									<Link
										to="/conversations"
										className="rounded-md px-3 py-2 text-sm text-gray-700 transition-all duration-300 hover:bg-gray-100"
									>
										Conversations
									</Link>
									{user?.roles?.includes("admin") && (
										<Link
											to="/users"
											className="rounded-md px-3 py-2 text-sm text-gray-700 transition-all duration-300 hover:bg-gray-100"
										>
											Users
										</Link>
									)}
									<Link
										to="/profile"
										className="rounded-md px-3 py-2 text-sm text-gray-700 transition-all duration-300 hover:bg-gray-100"
									>
										Profile
									</Link>
								</>
							)}
						</nav>

						<div className="flex items-center space-x-3">
							{isAuthenticated ? (
								<div className="flex items-center space-x-3">
									<span className="hidden text-sm text-gray-600 sm:block">
										Welcome, {user?.username}
									</span>
									<button
										onClick={handleLogout}
										className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-black"
									>
										Logout
									</button>
								</div>
							) : (
								<div className="flex items-center space-x-2">
									<Link
										to="/login"
										className="rounded-md px-3 py-2 text-sm text-gray-700 transition-all duration-300 hover:bg-gray-100"
									>
										Login
									</Link>
									<Link
										to="/register"
										className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-black"
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
			<footer className="mt-auto border-t border-gray-200 bg-white">
				<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
					<div className="text-center text-sm text-gray-500">
						&copy; 2026 Steelr. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	);
};

export default DefaultLayout;
