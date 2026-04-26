import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../lib/api";
import { PASSWORD_RECOVERY_ENDPOINT } from "../../lib/authEndpoints";
import {
	recoverPasswordSchema,
	type RecoverPasswordFormData,
} from "@components/auth/validation";

const RecoverPassword: React.FC = () => {
	const [successMessage, setSuccessMessage] = React.useState<string | null>(
		null,
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
				"If that email exists, a reset link has been sent to your inbox.",
			);
		} catch (error: any) {
			setSuccessMessage(null);
			console.error(
				"Recovery request failed:",
				error.response?.data?.message || error.message,
			);
		}
	};

	return (
		<div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 sm:p-10">
			<div className="mx-auto mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-xs font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5">
				RP
			</div>
			<h1
				id="recover-title"
				className="text-center text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl"
			>
				Reset your password
			</h1>
			<p className="mt-2 text-center text-sm leading-6 text-gray-600">
				Enter the email linked to your account. We’ll send you a secure link to
				set a new password.
			</p>

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
					/>
					{errors.email && (
						<p className="mt-1.5 text-xs text-red-600">
							{errors.email.message}
						</p>
					)}
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
				>
					{isSubmitting ? "Sending link..." : "Send reset link"}
				</button>
			</form>

			{successMessage && (
				<div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
					{successMessage}
				</div>
			)}

			<p className="mt-6 text-center text-sm text-gray-600">
				Remember your password?{" "}
				<Link
					to="/login"
					className="font-medium text-gray-900 transition-all duration-300 hover:opacity-70"
				>
					Sign in
				</Link>
			</p>
		</div>
	);
};

export default RecoverPassword;
