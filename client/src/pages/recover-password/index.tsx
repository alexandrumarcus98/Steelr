import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { PASSWORD_RECOVERY_ENDPOINT } from "@/lib/authEndpoints";
import {
	recoverPasswordSchema,
	type RecoverPasswordFormData,
} from "@/components/auth/validation";

const RecoverPassword: React.FC = () => {
	const { pathname } = useLocation();
	const [successMessage, setSuccessMessage] = React.useState<string | null>(
		null
	);
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
			setSuccessMessage(
				"If that email exists, a reset link has been sent to your inbox."
			);
		} catch (error: unknown) {
			setSuccessMessage(null);
			console.error(
				"Recovery request failed:",
				error instanceof Error ? error.message : "Unable to send reset link"
			);
		}
	};

	return (
		<div className="min-h-screen min-w-full bg-slate-50 px-4 py-8 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 sm:px-8 lg:px-16">
			<div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col items-center justify-center">
				<h1
					id="recover-title"
					className="w-full text-center text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl"
				>
					Reset your password
				</h1>
				<p className="mt-6 w-full text-center text-base leading-7 text-slate-500 dark:text-slate-400 sm:text-xl">
					Enter the email linked to your account. We’ll send you a secure link
					to set a new password.
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
						/>
						{errors.email && (
							<p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
								{errors.email.message}
							</p>
						)}
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
					>
						{isSubmitting ? "Sending link..." : "Send reset link"}
					</button>

					{successMessage && (
						<div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
							{successMessage}
						</div>
					)}
				</form>

				<p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
					Remember your password?{" "}
					<Link
						to="/login"
						state={{ from: pathname }}
						className="font-medium text-slate-900 transition-all duration-300 hover:opacity-70 dark:text-slate-100"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
};

export default RecoverPassword;
