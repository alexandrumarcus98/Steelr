import { Link, useLocation, useNavigate } from "react-router-dom";

import MoonIcon from "@/components/custom-components/moon-icon";
import SunIcon from "@/components/custom-components/sun-icon";

interface IHeaderProps {
	isAuthenticated: boolean;
	user: { username: string; roles: string[] } | null;
	logout: () => Promise<void>;
	theme: string;
	toggleTheme: () => void;
}

const HeaderComponent = ({ isAuthenticated, user, logout, theme, toggleTheme }: IHeaderProps) => {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const authLinkState = { from: pathname };

	const handleLogout = async () => {
		await logout();
		navigate("/");
	};

	return (
		<header className="header-component">
			<nav className="container mx-auto px-6 py-10">
				<Link
					to="/"
					className="flex items-center gap-2 font-display text-lg tracking-tight transition-opacity hover:opacity-70 letter-spacing-[-0.02em] font-weight-500 text-text"
				>
					<span className="block h-2 w-2 rounded-full bg-accent shadow-accent-dim" />
					Steelr
				</Link>

				<div className="hidden items-center gap-8 md:flex">
					{isAuthenticated && (
						<>
							<Link
								to="/dashboard"
								className="text-sm transition-colors duration-200 text-muted"
								onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
								onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
							>
								Dashboard
							</Link>
							<Link
								to="/feed"
								className="text-sm transition-colors duration-200 text-muted"
								onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
								onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
							>
								Feed
							</Link>
							{user?.roles?.includes("admin") && (
								<Link
									to="/users"
									className="text-sm transition-colors duration-200 text-muted"
									onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
									onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
								>
									Users
								</Link>
							)}
							<Link
								to="/profile"
								className="text-sm transition-colors duration-200 text-muted"
								onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
								onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
							>
								Profile
							</Link>
						</>
					)}
				</div>

				<div className="flex items-center gap-4">
					<button
						type="button"
						onClick={toggleTheme}
						aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
						className="flex h-9 w-9 items-center justify-center rounded-md  text-muted"
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

					{isAuthenticated ? (
						<div className="flex items-center gap-3">
							<span className="hidden text-sm sm:block text-muted">{user?.username}</span>
							<button
								onClick={handleLogout}
								className="inline-flex items-center rounded-full px-5 py-2 text-sm font-medium  border border-border-soft text-muted bg-transparent"
								onMouseEnter={(e) => {
									(e.currentTarget as HTMLElement).style.background = "var(--surface)";
									(e.currentTarget as HTMLElement).style.color = "var(--text)";
								}}
								onMouseLeave={(e) => {
									(e.currentTarget as HTMLElement).style.background = "transparent";
									(e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
								}}
							>
								Logout
							</button>
						</div>
					) : (
						<div className="flex items-center gap-3">
							<Link
								to="/login"
								state={authLinkState}
								className="inline-flex items-center rounded-full px-5 py-2 text-sm font-medium  border border-border-soft text-muted bg-transparent"
								onMouseEnter={(e) => {
									(e.currentTarget as HTMLElement).style.background = "var(--surface)";
									(e.currentTarget as HTMLElement).style.color = "var(--text)";
								}}
								onMouseLeave={(e) => {
									(e.currentTarget as HTMLElement).style.background = "transparent";
									(e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
								}}
							>
								Sign in
							</Link>
							<Link
								to="/register"
								state={authLinkState}
								className="inline-flex items-center rounded-full px-5 py-2 text-sm font-medium  hover:-translate-y-px bg-accent text-white shadow-accent-dim"
								onMouseEnter={(e) => {
									(e.currentTarget as HTMLElement).style.background = "var(--accent-hover)";
									(e.currentTarget as HTMLElement).style.boxShadow =
										"0 4px 20px var(--accent-soft)";
								}}
								onMouseLeave={(e) => {
									(e.currentTarget as HTMLElement).style.background = "var(--accent)";
									(e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px var(--accent-dim)";
								}}
							>
								Get started
							</Link>
						</div>
					)}
				</div>
			</nav>
		</header>
	);
};

export default HeaderComponent;
