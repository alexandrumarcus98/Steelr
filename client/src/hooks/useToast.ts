import { JSXElementConstructor } from "react";
import { toast } from "sonner"

export const useToast = () => {
	return {
		// Success toast
		success: (title: string, description?: string) =>
			toast.success(title, { description }),

		// Error toast
		error: (title: string, description?: string) =>
			toast.error(title, { description }),

		// Warning toast
		warning: (title: string, description?: string) =>
			toast.warning(title, { description }),

		// Info toast
		info: (title: string, description?: string) =>
			toast.info(title, { description }),

		// Custom toast
		custom: (component: React.ReactElement<any, string | JSXElementConstructor<any>>) =>
			toast.custom(() => component),

		// Loading toast with promise
		promise: <T>(promise: Promise<T>, options: {
			loading?: string;
			success?: string | ((data: T) => string);
			error?: string | ((error: unknown) => string);
		}) => toast.promise(promise, options),
	};
};
