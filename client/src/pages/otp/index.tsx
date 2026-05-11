import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OTPInput } from "input-otp";

import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/hooks/useToast";
import { normalizeApiError } from "@/lib/apiError";

import Slot, { FakeDash } from "./slot";

const OTP: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [otp, setOtp] = useState<string>("");
	const [now, setNow] = useState<number>(0);
	const [isResending, setIsResending] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const { verifyOTP, generateOTP } = useAuth();
	const { success, error, info } = useToast();
	const tempEmail = useAppSelector((state) => state.auth.tempEmail);

	const locationState = location.state as { email?: string; expiresAt?: string | number } | null;

	// Derive directly from props/Redux — no setState needed
	const emailFromState = locationState?.email || tempEmail;
	const expiresAt = locationState?.expiresAt ?? null;

	// Timer effect — only handles the ticking interval
	useEffect(() => {
		if (!expiresAt) return;

		const timer = window.setInterval(() => {
			setNow(Date.now());
		}, 1000);

		return () => window.clearInterval(timer);
	}, [expiresAt]);

	// Derived countdown — no effect needed
	const timeLeft = useMemo(() => {
		if (!expiresAt) return 0;
		const expiresAtMs = new Date(expiresAt).getTime();
		return Math.max(0, Math.floor((expiresAtMs - now) / 1000));
	}, [expiresAt, now]);

	// Guard — only one effect
	useEffect(() => {
		if (!emailFromState) {
			navigate("/login", { replace: true });
		}
	}, [emailFromState, navigate]);

	if (!emailFromState) {
		return null;
	}

	const handleComplete = async (value: string) => {
		if (isSubmitting || value.length !== 6) return;

		try {
			setIsSubmitting(true);
			await verifyOTP(emailFromState, value);
			success("OTP verified successfully");
			navigate("/dashboard", { replace: true });
		} catch (err) {
			const { message } = normalizeApiError(err, "OTP verification failed. Please try again.");
			error(message);
			setOtp("");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleResendOTP = async () => {
		try {
			setIsResending(true);
			const result = await generateOTP(emailFromState);
			setOtp("");

			if (result?.expiresAt) {
				// Update location state with new expiresAt
				navigate(".", {
					state: { ...locationState, expiresAt: result.expiresAt },
					replace: true,
				});
			}

			if (result.message.toLowerCase().includes("already exists")) {
				info(result.message);
			} else {
				success(result.message);
			}
		} catch (err) {
			const { message } = normalizeApiError(err, "Failed to resend OTP.");
			error(message);
		} finally {
			setIsResending(false);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-xl flex-col items-center py-12">
			<div className="mx-auto flex w-full flex-col items-center justify-center">
				<div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl border border-border-soft bg-surface/80 text-xs font-semibold text-slate-100 shadow-sm">
					OTP
				</div>

				<h1 className="font-display w-full text-center text-4xl font-semibold tracking-tight text-slate-50 sm:text-6xl">
					Enter the 6-digit code.
				</h1>

				<p className="mt-6 w-full text-center text-base leading-7 text-slate-300 sm:text-xl">
					We've sent a code to {emailFromState}
				</p>

				<div className="mt-10 w-full">
					<OTPInput
						value={otp}
						onChange={setOtp}
						maxLength={6}
						onComplete={handleComplete}
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
							className="text-sm font-medium text-slate-300 transition-colors duration-300 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isResending ? "Sending..." : timeLeft > 0 ? `Resend in ${timeLeft}s` : "Resend OTP"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OTP;
