import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/providers/auth";
import { useToast } from "@/hooks/useToast";
import { loginSchema, type LoginFormData } from "@/components/auth/validation";

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
	const { error, success } = useToast();

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);

		try {
			const response = await login(data);

			if (response.requiresOTP) {
				success("OTP sent to your email");
				navigate("/otp", {
					state: {
						email: response.tempEmail || data.email,
						fromPath,
						expiresAt: response.expiresAt, // ← Add this
					},
				});
				return;
			}

			error("Login failed", "OTP is required to complete login");
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unable to login";
			error("Login failed", errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const isButtonDisabled = isSubmitting || isLoading;

	return (
		<>
			{/* Loading overlay during transition */}
			{isLoading && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-slate-950/70">
					<div className="flex flex-col items-center gap-3">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 dark:border-slate-800 dark:border-t-slate-100" />
						<p className="text-sm font-medium text-slate-700 dark:text-slate-300">Sending code...</p>
					</div>
				</div>
			)}

			<div className="min-h-screen min-w-full bg-slate-50 px-4 py-8 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 sm:px-8 lg:px-16">
				<div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col items-center justify-center">
					<h1
						id="login-title"
						className="w-full text-center text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl"
					>
						Sign in to your account
					</h1>

					<p className="mt-6 w-full text-center text-base leading-7 text-slate-500 dark:text-slate-400 sm:text-xl">
						Welcome back. Enter your credentials to continue.
					</p>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="mt-10 w-full max-w-xl space-y-4"
						noValidate
					>
						<div>
							<label
								htmlFor="email"
								className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
							>
								Email address
							</label>
							<input
								type="email"
								id="email"
								placeholder="name@company.com"
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-100 dark:focus:ring-slate-100/10"
								{...register("email")}
								disabled={isButtonDisabled}
							/>
							{errors.email && (
								<p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
									{errors.email.message}
								</p>
							)}
						</div>

						<div>
							<div className="mb-1.5 flex items-center justify-between gap-2">
								<label
									htmlFor="password"
									className="block text-sm font-medium text-slate-700 dark:text-slate-300"
								>
									Password
								</label>
								<Link
									to="/recover-password"
									state={{ from: "/login" }}
									className="text-xs font-medium text-slate-500 transition-all duration-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
								>
									Forgot password?
								</Link>
							</div>
							<input
								type="password"
								id="password"
								placeholder="Enter your password"
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-100 dark:focus:ring-slate-100/10"
								{...register("password")}
								disabled={isButtonDisabled}
							/>
							{errors.password && (
								<p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
									{errors.password.message}
								</p>
							)}
						</div>

						<button
							type="submit"
							disabled={isButtonDisabled}
							className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
						>
							{isLoading ? "Sending code..." : "Sign in"}
						</button>
					</form>

					<p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
						Not a member?{" "}
						<Link
							to="/register"
							state={{ from: "/login" }}
							className="font-medium text-slate-900 transition-all duration-300 hover:opacity-70 dark:text-slate-100"
						>
							Create account
						</Link>
					</p>
				</div>
			</div>
		</>
	);
};

export default Login;
