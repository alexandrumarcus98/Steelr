import { cn } from "@sglara/cn";
import { SlotProps } from "input-otp";

const Slot = (props: SlotProps) => {
	return (
		<div
			className={cn(
				"relative w-20 h-24 text-[2rem]",
				"flex items-center justify-center",
				"transition-all duration-300",
				"border border-border-soft bg-surface/80 text-slate-100 first:border-l first:rounded-l-md last:rounded-r-md",
				"group-hover:border-cyan group-focus-within:border-cyan",
				"outline-0 outline-cyan/40",
				{ "outline-4 outline-cyan/40": props.isActive },
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
			<div className="h-9 w-px bg-cyan" />
		</div>
	);
};

export const FakeDash = () => {
	return (
		<div className="flex w-4 items-center justify-center sm:w-6">
			<div className="h-1 w-4 rounded-full bg-white/20" />
		</div>
	);
};

export default Slot;
