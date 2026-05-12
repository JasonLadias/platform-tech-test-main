---
name: pre-commit
description: Run ESLint (AirBnb config) across the backend and frontend, auto-fix what it can, resolve any remaining issues by editing the offending files, then verify with typecheck and tests. Use before committing/pushing, or when the user asks to "lint", "fix lint", "run the linter", or "clean up lint errors".
---

# pre-commit

Run the project linter, apply auto-fixes, manually resolve anything ESLint couldn't fix on its own, then verify the result with typecheck and tests.

## Procedure

1. **Auto-fix pass.** Run `npm run lint:fix` from the repo root. This invokes
   `eslint --fix "backend/**/*.ts" "frontend/**/*.{ts,tsx}"` using the AirBnb config.

2. **Report pass.** Run `npm run lint` to surface remaining problems ESLint
   could not auto-fix. Capture the output.

3. **Manual fixes.** For each remaining error/warning:
   - Open the file at the reported line with the Read tool.
   - Make the smallest change that satisfies the rule without altering behaviour.
   - Prefer fixing the code over disabling the rule. Only add
     `// eslint-disable-next-line <rule>` with a one-line justification when the
     rule genuinely doesn't apply (e.g. a generated file, a deliberate any at a
     boundary). Never use a blanket `/* eslint-disable */`.
   - Common AirBnb gotchas in this repo:
     - `import/extensions` — TS/TSX imports must be extensionless.
     - `react/jsx-filename-extension` — JSX only in `.tsx`.
     - `react/react-in-jsx-scope` — not needed with React 19 + the new JSX transform; the config should already allow this, but double-check before "fixing".
     - `@typescript-eslint/no-unused-vars` — prefix intentionally unused args with `_`.
     - `import/no-extraneous-dependencies` — test files may import devDependencies; production files may not.

4. **Verify.** Re-run `npm run lint`. If it exits 0, also run `npm run typecheck`
   and `npm test` to confirm the fixes didn't regress anything.

5. **Report back.** Summarise:
   - How many issues were auto-fixed.
   - Which files you hand-edited and why (one line each).
   - Final state of `lint`, `typecheck`, `test`.

## Guardrails

- Do not change runtime behaviour to silence a lint rule. If a rule is flagging a
  real issue (e.g. unused variable that should be wired up), surface it instead
  of deleting the code.
- Do not bulk-disable rules in `.eslintrc` to make the lint pass. If a rule is
  truly wrong for the project, raise it with the user before changing config.
- Do not reformat files that have no lint errors just because you're in there.
- Stop and ask the user if `lint:fix` makes >50 changes or touches files outside
  `backend/` and `frontend/` — that's usually a sign a config change is
  unintentionally rewriting the world.
