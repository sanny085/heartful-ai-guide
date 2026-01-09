import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import path from "path";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
    },
    plugins: [
        mdx({
            // Type mismatch between remark plugin versions; safe at runtime.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        }),
        react(),
        mode === "development" && componentTagger(),
    ].filter(Boolean),
    base: process.env.VITE_DOMAIN || "/",
    build: {
        outDir:
            mode === "production"
                ? "dist-prod"
                : mode === "development"
                    ? "dist-dev"
                    : "dist",
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
