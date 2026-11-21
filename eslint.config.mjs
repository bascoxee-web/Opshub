import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import firebaseRulesPlugin from "@firebase/eslint-plugin-security-rules";

export default defineConfig([
  {
    ignores: ["dist/**/*", ".next/**/*", ".next-dev/**/*", "firestore.rules.test.ts"],
  },
  {
    extends: [...next],
  },
  firebaseRulesPlugin.configs["flat/recommended"],
]);
