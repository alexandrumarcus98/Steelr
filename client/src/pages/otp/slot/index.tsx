import { SlotProps } from "input-otp";
import { cn } from "@sglara/cn";

const Slot = (props: SlotProps) => {
	return (
		<div
			className={cn(
				"relative w-20 h-24 text-[2rem]",
				"flex items-center justify-center",
				"transition-all duration-300",
				"border border-slate-200 bg-white text-slate-900 first:border-l first:rounded-l-md last:rounded-r-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
				"group-hover:border-slate-400 group-focus-within:border-slate-400 dark:group-hover:border-slate-600 dark:group-focus-within:border-slate-600",
				"outline-0 outline-slate-400 dark:outline-slate-600",
				{ "outline-4 outline-accent-foreground": props.isActive }
			)}
		>
			{props.char !== null && <div>{props.char}</div>}
			{props.hasFakeCaret && <FakeCaret />}
		</div>
	);
};

const FakeCaret = () => {
	return (
		<div className="absolute inset-0 flex items-center justify-center pointer-events-none caret-blink">
			<div className="h-9 w-px bg-slate-900 dark:bg-slate-100" />
		</div>
	);
};

export const FakeDash = () => {
	return (
		<div className="flex w-4 items-center justify-center sm:w-6">
			<div className="h-1 w-4 rounded-full bg-slate-300 dark:bg-slate-700" />
		</div>
	);
};

export default Slot;
