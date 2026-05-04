import React from "react";
import { Toaster } from "sonner";

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<>
			{children}
			<Toaster position="top-right" closeButton={true} />
		</>
	);
};

export default ToastProvider;
