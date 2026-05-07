import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/providers/auth";
import { useToast } from "@/hooks/useToast";

import {
	registerSchema,
	type RegisterFormData,
} from "@/components/auth/validation";

const Register: React.FC = () => {
	const { register: registerUser } = useAuth();
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
	});

	const { error } = useToast();

	const onSubmit = async (data: RegisterFormData) => {
		try {
			await registerUser({
				username: data.username,
				email: data.email,
				password: data.password,
			});
			navigate("/dashboard");
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Registration failed";
			error("Registration failed", errorMessage);
		}
	};

	return (
		<div className="min-h-screen min-w-full bg-slate-50 px-4 py-8 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 sm:px-8 lg:px-16">
			<div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col items-center justify-center">
				<h1
					id="register-title"
					className="w-full text-center text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl"
				>
					Create your account
				</h1>
				<p className="mt-6 w-full text-center text-base leading-7 text-slate-500 dark:text-slate-400 sm:text-xl">
					Join the platform and get started in a few seconds.
				</p>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="mt-10 w-full max-w-2xl space-y-4"
					noValidate
				>
					<div>
						<label
							htmlFor="username"
							className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							Username
						</label>
						<input
							type="text"
							id="username"
							placeholder="johndoe"
							className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-100 dark:focus:ring-slate-100/10"
							{...register("username")}
						/>
						{errors.username && (
							<p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
								{errors.username.message}
							</p>
						)}
					</div>

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

					<div>
						<label
							htmlFor="password"
							className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							Password
						</label>
						<input
							type="password"
							id="password"
							placeholder="Create a password"
							className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-100 dark:focus:ring-slate-100/10"
							{...register("password")}
						/>
						{errors.password && (
							<p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
								{errors.password.message}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="confirmPassword"
							className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
						>
							Confirm password
						</label>
						<input
							type="password"
							id="confirmPassword"
							placeholder="Repeat your password"
							className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-100 dark:focus:ring-slate-100/10"
							{...register("confirmPassword")}
						/>
						{errors.confirmPassword && (
							<p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
								{errors.confirmPassword.message}
							</p>
						)}
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
					>
						{isSubmitting ? "Creating account..." : "Create account"}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
					Already have an account?{" "}
					<Link
						to="/login"
						state={{ from: "/register" }}
						className="font-medium text-slate-900 transition-all duration-300 hover:opacity-70 dark:text-slate-100"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
};

export default Register;
