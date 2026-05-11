import React, { createContext, type ReactNode, useLayoutEffect, useState } from "react";

export type Theme = "light" | "dark";
const STORAGE_KEY = "steelr-theme";

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const resolveInitialTheme = (): Theme => {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === "light" || stored === "dark") return stored;
	// Fall back to OS preference
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (theme: Theme) => {
	document.documentElement.classList.toggle("dark", theme === "dark");
	document.documentElement.style.colorScheme = theme;
	localStorage.setItem(STORAGE_KEY, theme);
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [theme, setTheme] = useState<Theme>(resolveInitialTheme);

	useLayoutEffect(() => {
		applyTheme(theme);
	}, [theme]);

	const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

	return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;
