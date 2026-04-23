import React from "react";
import { Outlet } from "react-router-dom";

const DefaultLayout: React.FC = () => {
	return (
		<div className="flex flex-col min-h-screen">
			{/* Navbar */}
			<header className="bg-blue-600 text-white shadow-md">
				<div className="container mx-auto px-4 py-3 flex justify-between items-center">
					<h1 className="text-lg font-semibold">MyApp</h1>
					<nav>
						<a href="#" className="px-2">
							Home
						</a>
						<a href="#" className="px-2">
							Create Post
						</a>
						<a href="#" className="px-2">
							Profile
						</a>
					</nav>
				</div>
			</header>

			{/* Main Content */}
			<main className="grow container mx-auto px-4 py-8">
				<Outlet />
			</main>

			{/* Footer */}
			<footer className="bg-gray-200 text-center text-gray-600 py-4 mt-auto">
				&copy; 2023 MyApp. All rights reserved.
			</footer>
		</div>
	);
};

export default DefaultLayout;
