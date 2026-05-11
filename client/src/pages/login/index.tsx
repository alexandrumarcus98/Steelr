import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useToast } from "@/hooks/useToast";
import { normalizeApiError } from "@/lib/apiError";
import { useAuth } from "@/hooks/useAuth";

import { type LoginFormData, loginSchema } from "@/components/auth/validation";

const Login: React.FC = () => {
	const { login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [isLoading, setIsLoading] = useState(false);
	const fromPath = (location.state as { from?: string } | null)?.from;
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});
	const { error, success, info } = useToast();

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);
		try {
			const response = await login(data);

			if (response.requiresOTP) {
				const msg = response.message ?? "OTP is required";
				if (msg.toLowerCase().includes("already exists")) info(msg);
				else success(msg);

				navigate("/otp", {
					state: {
						email: response.tempEmail || data.email,
						fromPath,
						expiresAt: response.expiresAt,
					},
				});
				return;
			}

			error("Login failed", "OTP is required to complete login");
		} catch (err) {
			const { message } = normalizeApiError(err, "Login failed. Please try again.");
			error(message);
		} finally {
			setIsLoading(false);
		}
	};

	const isButtonDisabled = isSubmitting || isLoading;

	return (
		<>
			{isLoading && (
				<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
					<div className="flex flex-col items-center gap-3">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-t-text-muted" />
						<p className="text-sm font-medium text-muted">Sending code...</p>
					</div>
				</div>
			)}

			<div className="mx-auto flex w-full max-w-xl flex-col items-center py-12">
				<h1 className="font-display w-full text-center text-4xl tracking-tight sm:text-6xl text-text font-semibold">
					Sign in to your account
				</h1>

				<form onSubmit={handleSubmit(onSubmit)} className="mt-10 w-full space-y-4" noValidate>
					<div>
						<label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text">
							Email address
						</label>
						<input
							type="email"
							id="email"
							placeholder="name@company.com"
							className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-200 border-border-soft bg-surface text-text"
							onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
							{...register("email", {
								onBlur: (e) => (e.currentTarget.style.borderColor = "var(--border)"),
							})}
							disabled={isButtonDisabled}
						/>
						{errors.email && <p className="mt-1.5 text-xs text-accent">{errors.email.message}</p>}
					</div>

					<div>
						<div className="mb-1.5 flex items-center justify-between gap-2">
							<label htmlFor="password" className="block text-sm font-medium text-text">
								Password
							</label>
							<Link
								to="/recover-password"
								state={{ from: "/login" }}
								className="text-xs font-medium transition-colors duration-200 text-text"
								onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
								onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-text)")}
							>
								Forgot password?
							</Link>
						</div>
						<input
							type="password"
							id="password"
							placeholder="Enter your password"
							className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-200 border-border-soft bg-surface text-text"
							onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
							{...register("password", {
								onBlur: (e) => (e.currentTarget.style.borderColor = "var(--border)"),
							})}
							disabled={isButtonDisabled}
						/>
						{errors.password && (
							<p className="mt-1.5 text-xs text-accent">{errors.password.message}</p>
						)}
					</div>

					<button
						type="submit"
						disabled={isButtonDisabled}
						className="inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70 bg-accent text-text shadow-accent-dim"
					>
						{isLoading ? "Sending code..." : "Sign in"}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-muted">
					Not a member?{" "}
					<Link
						to="/register"
						state={{ from: "/login" }}
						className="font-medium transition-colors duration-200 text-muted"
						onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
						onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
					>
						Create account
					</Link>
				</p>
			</div>
		</>
	);
};

export default Login;
