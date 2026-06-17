import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Archived pre-rebuild stack — not part of the new app.
    "legacy/**",
    // Vendored OCR engine assets (Tesseract worker/wasm/lang) — not our source.
    "public/ocr/**",
    // Node utility + test scripts (build helpers, E2E harness) — not app source.
    "scripts/**",
  ]),
]);

export default eslintConfig;
