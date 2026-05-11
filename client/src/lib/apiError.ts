import axios from "axios";

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
	if (axios.isAxiosError(error)) {
		const responseMessage = error.response?.data?.message;

		if (typeof responseMessage === "string" && responseMessage.trim()) {
			return responseMessage;
		}
	}

	if (error instanceof Error && error.message.trim()) {
		return error.message;
	}

	if (typeof error === "string" && error.trim()) {
		return error;
	}

	return fallback;
};

export const normalizeApiError = (err: unknown, msg: string | undefined) => ({
	message: getApiErrorMessage(err, msg ?? "Something went wrong."),
	raw: err,
});
