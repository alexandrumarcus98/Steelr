import { Link } from "react-router-dom";
import { useAuth } from "./providers/auth";

function App() {
	const { isAuthenticated } = useAuth();

	return (
		<div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
			<div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 sm:p-10">
				<div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5">
					ST
				</div>
				<h1 className="text-center text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
					Steelr Workspace
				</h1>
				<p className="mx-auto mt-3 max-w-xl text-center text-base text-gray-600 sm:text-lg">
					Minimal tools for teams: auth, users, dashboard, and profile
					management.
				</p>

				<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
					{isAuthenticated ? (
						<Link
							to="/dashboard"
							className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-black hover:opacity-95 sm:w-auto"
						>
							Go to Dashboard
						</Link>
					) : (
						<>
							<Link
								to="/login"
								className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-black hover:opacity-95 sm:w-auto"
							>
								Sign In
							</Link>
							<Link
								to="/register"
								className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-900 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 sm:w-auto"
							>
								Create Account
							</Link>
						</>
					)}
				</div>

				<div className="mt-10 grid gap-3 sm:grid-cols-3">
					<div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-center text-sm text-gray-700 transition-all duration-300 hover:bg-white">
						Users + RBAC
					</div>
					<div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-center text-sm text-gray-700 transition-all duration-300 hover:bg-white">
						Auth + Session
					</div>
					<div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-center text-sm text-gray-700 transition-all duration-300 hover:bg-white">
						Dashboard Flow
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
