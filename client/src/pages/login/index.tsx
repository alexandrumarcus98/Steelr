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
	const fromPath = (location.state as { from?: { pathname?: string } } | null)
		?.from?.pathname;
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
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
					<div className="flex flex-col items-center gap-3">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
						<p className="text-sm font-medium text-gray-700">Sending code...</p>
					</div>
				</div>
			)}

			<div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 sm:p-10">
				<div className="mx-auto mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-xs font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5">
					SL
				</div>
				<h1
					id="login-title"
					className="text-center text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl"
				>
					Sign in to your account
				</h1>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="mt-7 space-y-4"
					noValidate
				>
					<div>
						<label
							htmlFor="email"
							className="mb-1.5 block text-sm font-medium text-gray-700"
						>
							Email address
						</label>
						<input
							type="email"
							id="email"
							placeholder="name@company.com"
							className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-gray-900"
							{...register("email")}
							disabled={isButtonDisabled}
						/>
						{errors.email && (
							<p className="mt-1.5 text-xs text-red-600">
								{errors.email.message}
							</p>
						)}
					</div>

					<div>
						<div className="mb-1.5 flex items-center justify-between gap-2">
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password
							</label>
							<Link
								to="/recover-password"
								className="text-xs font-medium text-gray-600 transition-all duration-300 hover:text-gray-900"
							>
								Forgot password?
							</Link>
						</div>
						<input
							type="password"
							id="password"
							placeholder="Enter your password"
							className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-gray-900"
							{...register("password")}
							disabled={isButtonDisabled}
						/>
						{errors.password && (
							<p className="mt-1.5 text-xs text-red-600">
								{errors.password.message}
							</p>
						)}
					</div>

					<button
						type="submit"
						disabled={isButtonDisabled}
						className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isLoading ? "Sending code..." : "Sign in"}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-gray-600">
					Not a member?{" "}
					<Link
						to="/register"
						className="font-medium text-gray-900 transition-all duration-300 hover:opacity-70"
					>
						Create account
					</Link>
				</p>
			</div>
		</>
	);
};

export default Login;
