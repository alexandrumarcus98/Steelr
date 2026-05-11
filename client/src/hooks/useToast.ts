import type { ReactElement } from "react";

import { toast } from "sonner";

export const useToast = () => {
	return {
		success: (title: string, description?: string) => toast.success(title, { description }),
		error: (title: string, description?: string) => toast.error(title, { description }),
		warning: (title: string, description?: string) => toast.warning(title, { description }),
		info: (title: string, description?: string) => toast.info(title, { description }),
		custom: (component: ReactElement) => toast.custom(() => component),
		promise: <T>(
			promise: Promise<T>,
			options: {
				loading?: string;
				success?: string | ((data: T) => string);
				error?: string | ((error: unknown) => string);
			},
		) => toast.promise(promise, options),
	};
};
