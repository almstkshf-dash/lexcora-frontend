import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import nextIntlPlugin from "eslint-plugin-next-intl";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  nextIntlPlugin.configs.recommended,
  {
    rules: {
      "next-intl/missing-messages": ["error", {
        "messageDirectory": "./messages"
      }]
    }
  }
];

export default eslintConfig;
