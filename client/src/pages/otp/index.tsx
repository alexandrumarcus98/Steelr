import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OTPInput } from "input-otp";

import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/providers/auth";
import { useAppSelector } from "@/store/hooks";

import Slot, { FakeDash } from "./slot";

const OTP: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [otp, setOtp] = useState("");
	const [timeLeft, setTimeLeft] = useState(0);
	const [isResending, setIsResending] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { verifyOTP, generateOTP } = useAuth();
	const tempEmail = useAppSelector((state) => state.auth.tempEmail);
	const { success, error } = useToast();

	const emailFromState =
		(location.state as { email?: string } | null)?.email || tempEmail;

	useEffect(() => {
		if (!emailFromState) {
			navigate("/login");
		}
	}, [emailFromState, navigate]);

	useEffect(() => {
		const expiresAtString = (location.state as { expiresAt?: string } | null)
			?.expiresAt;

		if (!expiresAtString) {
			setTimeLeft(0);
			return;
		}

		const expiresAt = new Date(expiresAtString).getTime();

		const updateTimeLeft = () => {
			const now = new Date().getTime();
			const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
			setTimeLeft(remaining);
		};

		updateTimeLeft();
		const timer = setInterval(updateTimeLeft, 1000);

		return () => clearInterval(timer);
	}, [location.state]);

	if (!emailFromState) {
		return null;
	}

	const handleComplete = async (value: string) => {
		if (isSubmitting || value.length !== 6) {
			return;
		}

		try {
			setIsSubmitting(true);
			await verifyOTP(emailFromState, value);
			success("OTP verified successfully");
			navigate("/dashboard", { replace: true });
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to verify OTP. Please try again.";
			error("Invalid OTP", errorMessage);
			setOtp("");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleResendOTP = async () => {
		try {
			setIsResending(true);
			const result = await generateOTP(emailFromState);
			success("New OTP sent successfully");
			setOtp("");

			if (result?.expiresAt) {
				const expiresAt = new Date(result.expiresAt).getTime();
				const now = new Date().getTime();
				setTimeLeft(Math.max(0, Math.floor((expiresAt - now) / 1000)));
			}
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to resend OTP";
			error("Resend failed", errorMessage);
		} finally {
			setIsResending(false);
		}
	};

	return (
		<div className="min-h-screen min-w-full bg-slate-50 px-4 py-8 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 sm:px-8 lg:px-16">
			<div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center">
				<div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
					OTP
				</div>

				<h1 className="w-full text-center text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl">
					Enter the 6-digit code.
				</h1>

				<p className="mt-6 w-full text-center text-base leading-7 text-slate-500 dark:text-slate-400 sm:text-xl">
					We've sent a code to {emailFromState}
				</p>

				<div className="mt-10 w-full">
					<OTPInput
						value={otp}
						onChange={setOtp}
						maxLength={6}
						onComplete={(value) => {
							void handleComplete(value);
						}}
						pushPasswordManagerStrategy="none"
						containerClassName="group flex items-center justify-center gap-2 sm:gap-4"
						render={({ slots }) => (
							<>
								<div className="flex">
									{slots.slice(0, 3).map((slot, idx) => (
										<Slot key={idx} {...slot} isActive={idx === 0} />
									))}
								</div>

								<FakeDash />

								<div className="flex">
									{slots.slice(3).map((slot, idx) => (
										<Slot key={idx} {...slot} />
									))}
								</div>
							</>
						)}
					/>

					<div className="mt-6 text-center">
						<button
							type="button"
							onClick={handleResendOTP}
							disabled={timeLeft > 0 || isResending}
							className="text-sm font-medium text-slate-700 transition-colors duration-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:text-slate-100"
						>
							{isResending
								? "Sending..."
								: timeLeft > 0
									? `Resend in ${timeLeft}s`
									: "Resend OTP"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OTP;
