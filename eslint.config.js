import js from "@eslint/js";
import tseslint from "typescript-eslint";

const MODULE = "src/modules/url-shortener";

const MODULE_ONLY_PATTERNS = ["react", "react-dom", "react/jsx-runtime", "*/react/*", "**/react/*"];

const LIB_OR_CONTEXT_PATTERNS = [
  "@/lib/*",
  "**/lib/*",
  "@/context/*",
  "**/context/*",
  "@/pages/*",
  "**/pages/*",
  "@/shared/*",
  "**/shared/*",
];

export default tseslint.config(
  {
    ignores: ["dist", "dist-ssr", "node_modules", "*.local", "*.tsbuildinfo", "coverage"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: [`${MODULE}/domain/**`, `${MODULE}/application/**`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: MODULE_ONLY_PATTERNS,
          patterns: [
            {
              group: LIB_OR_CONTEXT_PATTERNS,
              message: "domain/application must not import src/lib, context, pages or shared",
            },
            {
              group: [
                `${MODULE}/adapters/**`,
                `${MODULE}/presentation/**`,
                "**/adapters/**",
                "**/presentation/**",
              ],
              message: "domain/application must not reach into adapters or presentation",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message: "domain/application must be transport-free; use ports + adapters",
        },
      ],
    },
  },
  {
    files: [`${MODULE}/adapters/**`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: ["react", "react-dom", "react/jsx-runtime"],
          patterns: [
            { group: "@/lib/*", message: "adapters may import only src/lib/api.ts for transport" },
            {
              group: [`${MODULE}/presentation/**`, "**/presentation/**"],
              message: "adapters must not import presentation",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        { name: "fetch", message: "adapters must delegate HTTP to src/lib/api.ts" },
      ],
    },
  },
  {
    files: [`${MODULE}/presentation/**`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [`${MODULE}/adapters/**`, "**/adapters/**"],
              message:
                "presentation speaks through use cases (ports/in + application), never adapters",
            },
          ],
        },
      ],
    },
  },
);
