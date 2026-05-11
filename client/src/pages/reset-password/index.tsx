import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PASSWORD_RESET_ENDPOINT, PASSWORD_RESET_TOKEN_VERIFY_ENDPOINT } from "@/lib/authEndpoints";
import api from "@/lib/api";
import { normalizeApiError } from "@/lib/apiError";

import TickGreen from "@/components/custom-components/tick/Tick";

import { type ResetPasswordFormData, resetPasswordSchema } from "@/components/auth/validation";

const ResetPassword: React.FC = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token") || "";
	const [isLoading, setLoading] = useState<boolean>(true);
	const [warningMessage, setWarningMessage] = useState<string | null>(null);
	const [isTokenValid, setIsTokenValid] = useState(false);
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
	});

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			let isActive = true;
			setLoading(true);
			setWarningMessage(null);
			setIsTokenValid(false);

			const verifyToken = async () => {
				if (!token) {
					if (isActive) {
						setWarningMessage(
							"This reset link is invalid or has expired. Please request a new one.",
						);
						setLoading(false);
					}
					return;
				}

				try {
					await api.get(PASSWORD_RESET_TOKEN_VERIFY_ENDPOINT, {
						params: { token },
					});

					if (isActive) {
						setIsTokenValid(true);

						setTimeout(() => {
							setLoading(false);
						}, 1200);
					}
				} catch {
					if (isActive) {
						setWarningMessage(
							"This reset link is invalid or has expired. Please request a new one.",
						);
						setLoading(false);
					}
				}
			};

			void verifyToken();

			return () => {
				isActive = false;
			};
		}, 1000);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [token]);

	console.log(isLoading);

	const onSubmit = async (data: ResetPasswordFormData) => {
		try {
			await api.post(PASSWORD_RESET_ENDPOINT, {
				token,
				password: data.password,
				confirmPassword: data.confirmPassword,
			});
			setSuccessMessage("Password updated successfully. You can now sign in.");
			setTimeout(() => navigate("/login", { replace: true }), 1200);
		} catch (err) {
			const { message } = normalizeApiError(err, "Failed to reset password. Please try again.");
			setSuccessMessage(null);
			setWarningMessage(message);
		}
	};

	return (
		<>
			{isLoading && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
					{!isTokenValid && (
						<div className="flex flex-col items-center gap-3">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
							<p className="text-sm font-medium">Checking reset link...</p>
						</div>
					)}

					{isTokenValid && <TickGreen />}
				</div>
			)}

			<div className="min-h-screen min-w-full bg-bg px-4 py-8 text-slate-100 transition-colors duration-200 sm:px-8 lg:px-16">
				<div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center">
					<h1 className="font-display w-full text-center text-4xl font-semibold tracking-tight text-slate-50 sm:text-6xl">
						Choose a new password
					</h1>
					<p className="mt-6 w-full text-center text-base leading-7 text-slate-300 sm:text-xl">
						Enter your new password below to complete the reset process.
					</p>

					{!isLoading && warningMessage && (
						<div className="mt-8 w-full max-w-xl rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
							{warningMessage}
						</div>
					)}

					{!isLoading && isTokenValid && (
						<form
							onSubmit={handleSubmit(onSubmit)}
							className="mt-10 w-full max-w-xl space-y-4"
							noValidate
						>
							<div>
								<label
									htmlFor="password"
									className="mb-1.5 block text-sm font-medium text-slate-300"
								>
									New password
								</label>
								<input
									type="password"
									id="password"
									placeholder="Create a new password"
									className="w-full rounded-xl border border-border-soft bg-surface/80 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan focus:ring-2 focus:ring-cyan/15"
									{...register("password")}
								/>
								{errors.password && (
									<p className="mt-1.5 text-xs text-red-300">{errors.password.message}</p>
								)}
							</div>

							<div>
								<label
									htmlFor="confirmPassword"
									className="mb-1.5 block text-sm font-medium text-slate-300"
								>
									Confirm password
								</label>
								<input
									type="password"
									id="confirmPassword"
									placeholder="Repeat your new password"
									className="w-full rounded-xl border border-border-soft bg-surface/80 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan focus:ring-2 focus:ring-cyan/15"
									{...register("confirmPassword")}
								/>
								{errors.confirmPassword && (
									<p className="mt-1.5 text-xs text-red-300">{errors.confirmPassword.message}</p>
								)}
							</div>

							<button
								type="submit"
								disabled={isSubmitting || !token}
								className="inline-flex w-full items-center justify-center rounded-xl bg-cyan px-4 py-2.5 text-sm font-medium text-bg transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
							>
								{isSubmitting ? "Updating password..." : "Update password"}
							</button>

							{successMessage && (
								<div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
									{successMessage}
								</div>
							)}
						</form>
					)}

					<p className="mt-6 text-center text-sm text-slate-400">
						Remembered your password?{" "}
						<Link
							to="/login"
							state={{ from: pathname }}
							className="font-medium text-slate-100 transition-all duration-300 hover:opacity-70"
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</>
	);
};

export default ResetPassword;
