import React from "react";

import { Link, useLocation } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { type RecoverPasswordFormData, recoverPasswordSchema } from "@/components/auth/validation";

import api from "@/lib/api";
import { PASSWORD_RECOVERY_ENDPOINT } from "@/lib/authEndpoints";

const RecoverPassword: React.FC = () => {
	const { pathname } = useLocation();
	const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RecoverPasswordFormData>({
		resolver: zodResolver(recoverPasswordSchema),
	});

	const onSubmit = async (data: RecoverPasswordFormData) => {
		try {
			await api.post(PASSWORD_RECOVERY_ENDPOINT, data);
			setSuccessMessage("If that email exists, a reset link has been sent to your inbox.");
		} catch (error: unknown) {
			const apiError = error as {
				response?: {
					data?: {
						message?: string;
					};
				};
			};
			setSuccessMessage(null);
			console.error(
				"Recovery request failed:",
				apiError.response?.data?.message || "An unexpected error occurred",
			);
		}
	};

	return (
		<div className="min-h-screen min-w-full bg-bg px-4 py-8 text-slate-100 transition-colors duration-200 sm:px-8 lg:px-16">
			<div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center">
				<h1
					id="recover-title"
					className="font-display w-full text-center text-4xl font-semibold tracking-tight text-slate-50 sm:text-6xl"
				>
					Reset your password
				</h1>
				<p className="mt-6 w-full text-center text-base leading-7 text-slate-300 sm:text-xl">
					Enter the email linked to your account. We’ll send you a secure link to set a new
					password.
				</p>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="mt-10 w-full max-w-xl space-y-4"
					noValidate
				>
					<div>
						<label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
							Email address
						</label>
						<input
							type="email"
							id="email"
							placeholder="name@company.com"
							className="w-full rounded-xl border border-border-soft bg-surface/80 px-3.5 py-2.5 text-sm text-slate-100 outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan focus:ring-2 focus:ring-cyan/15"
							{...register("email")}
						/>
						{errors.email && <p className="mt-1.5 text-xs text-red-300">{errors.email.message}</p>}
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex w-full items-center justify-center rounded-xl bg-cyan px-4 py-2.5 text-sm font-medium text-bg transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isSubmitting ? "Sending link..." : "Send reset link"}
					</button>

					{successMessage && (
						<div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
							{successMessage}
						</div>
					)}
				</form>

				<p className="mt-6 text-center text-sm text-slate-400">
					Remember your password?{" "}
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
	);
};

export default RecoverPassword;
