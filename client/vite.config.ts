import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
	plugins: [react(), tsconfigPaths(), tailwindcss()],
	server: {
		port: 5173,
	},
	resolve: {
		alias: {
			"@/*": "/src/*",
			"@sass/*": "/src/assets/sass/*",
			"@css/*": "/src/assets/css/*",
			"@components/*": "/src/components/*",
			"@layouts/*": "/src/providers/layouts/*",
		},
	},
});
