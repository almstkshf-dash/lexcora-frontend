import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import nextIntlPlugin from "eslint-plugin-next-intl";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    plugins: { "next-intl": nextIntlPlugin },
    rules: {
      "next-intl/no-dynamic-translation-key": "warn",
      "next-intl/use-next-intl-link-over-next-link": "warn",
      "next-intl/use-router-from-next-intl": "warn",
    },
  },
];

export default eslintConfig;
