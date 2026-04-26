import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/providers/auth";
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

	const onSubmit = async (data: RegisterFormData) => {
		try {
			await registerUser({
				username: data.username,
				email: data.email,
				password: data.password,
			});
			console.log("Registration successful");
			navigate("/dashboard");
		} catch (error: any) {
			console.error(
				"Registration failed:",
				error.response?.data?.message || error.message,
			);
		}
	};

	return (
		<div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 sm:p-10">
			<div className="mx-auto mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-xs font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5">
				RG
			</div>
			<h1
				id="register-title"
				className="text-center text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl"
			>
				Create your account
			</h1>

			<form
				onSubmit={handleSubmit(onSubmit)}
				className="mt-7 space-y-4"
				noValidate
			>
				<div>
					<label
						htmlFor="username"
						className="mb-1.5 block text-sm font-medium text-gray-700"
					>
						Username
					</label>
					<input
						type="text"
						id="username"
						placeholder="johndoe"
						className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-gray-900"
						{...register("username")}
					/>
					{errors.username && (
						<p className="mt-1.5 text-xs text-red-600">
							{errors.username.message}
						</p>
					)}
				</div>

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

				<div>
					<label
						htmlFor="password"
						className="mb-1.5 block text-sm font-medium text-gray-700"
					>
						Password
					</label>
					<input
						type="password"
						id="password"
						placeholder="Create a password"
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
						placeholder="Repeat your password"
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
					disabled={isSubmitting}
					className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
				>
					{isSubmitting ? "Creating account..." : "Create account"}
				</button>
			</form>

			<p className="mt-6 text-center text-sm text-gray-600">
				Already have an account?{" "}
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

export default Register;
