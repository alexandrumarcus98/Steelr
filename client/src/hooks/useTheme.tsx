import { useContext } from "react";
export type Theme = "light" | "dark";

import ThemeContext from "@/providers/theme";

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

export const useTheme = (): ThemeContextType => {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
};
