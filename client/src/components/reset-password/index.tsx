import React from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../lib/api";
import { PASSWORD_RESET_ENDPOINT } from "../../lib/authEndpoints";
import {
	resetPasswordSchema,
	type ResetPasswordFormData,
} from "@components/auth/validation";

const ResetPassword: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const token = searchParams.get("token") || "";
	const [successMessage, setSuccessMessage] = React.useState<string | null>(
		null,
	);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
	});

	const onSubmit = async (data: ResetPasswordFormData) => {
		try {
			await api.post(PASSWORD_RESET_ENDPOINT, {
				token,
				password: data.password,
				confirmPassword: data.confirmPassword,
			});
			setSuccessMessage("Password updated successfully. You can now sign in.");
			setTimeout(() => navigate("/login", { replace: true }), 1200);
		} catch (error: any) {
			setSuccessMessage(null);
			console.error(
				"Reset password failed:",
				error.response?.data?.message || error.message,
			);
		}
	};

	return (
		<div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 sm:p-10">
			<div className="mx-auto mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-xs font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5">
				RW
			</div>
			<h1 className="text-center text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
				Choose a new password
			</h1>
			<p className="mt-2 text-center text-sm leading-6 text-gray-600">
				Enter your new password below to complete the reset process.
			</p>

			{!token && (
				<div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
					Missing or invalid reset token. Please request a new recovery link.
				</div>
			)}

			<form
				onSubmit={handleSubmit(onSubmit)}
				className="mt-7 space-y-4"
				noValidate
			>
				<div>
					<label
						htmlFor="password"
						className="mb-1.5 block text-sm font-medium text-gray-700"
					>
						New password
					</label>
					<input
						type="password"
						id="password"
						placeholder="Create a new password"
						className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-gray-900"
						{...register("password")}
					/>
					{errors.password && (
						<p className="mt-1.5 text-xs text-red-600">
							{errors.password.message}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor="confirmPassword"
						className="mb-1.5 block text-sm font-medium text-gray-700"
					>
						Confirm password
					</label>
					<input
						type="password"
						id="confirmPassword"
						placeholder="Repeat your new password"
						className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-gray-900"
						{...register("confirmPassword")}
					/>
					{errors.confirmPassword && (
						<p className="mt-1.5 text-xs text-red-600">
							{errors.confirmPassword.message}
						</p>
					)}
				</div>

				<button
					type="submit"
					disabled={isSubmitting || !token}
					className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
				>
					{isSubmitting ? "Updating password..." : "Update password"}
				</button>
			</form>

			{successMessage && (
				<div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
					{successMessage}
				</div>
			)}

			<p className="mt-6 text-center text-sm text-gray-600">
				Remembered your password?{" "}
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

export default ResetPassword;
