# Platform Tech Test

A small full-stack app: a React form on the frontend submits data to an Express backend, which stores a file and echoes the submission back. See [TASK.md](./TASK.md) for the original assignment.

## Setup

```
cp .env.example .env
npm i
npm start
```

`npm start` runs the backend and frontend together. They can also be run individually with `npm run start-backend` and `npm run start-frontend`.

## Other scripts

```
npm run typecheck   # type-check backend and frontend
npm run lint        # lint (AirBnb config)
npm run lint:fix    # lint and auto-fix
npm test            # run all tests
```

## Implementation notes

The points below correspond one-to-one with the assignment in [TASK.md](./TASK.md).

1. **Form styling** — styled with CSS Modules (`SubmissionForm.module.css`) for scoped class names and zero runtime overhead.
2. **File upload with drag & drop** — `react-dropzone` powers the `FileDropzone` component on the frontend; `multer` stores files under `backend/uploads/` and the API returns the relative path on success.
3. **Validation** — shared rules (name required, message ≥ 5 chars, file required) are enforced both in the React form (inline field errors with `aria-invalid`/`role="alert"`) and on the Express side (`backend/src/validation.ts`), so the server never trusts client input.
4. **Linting** — AirBnb config (`eslint-config-airbnb` + `eslint-config-airbnb-typescript`) wired up in `.eslintrc.cjs` with separate overrides for backend, frontend, and test files. Runs via `npm run lint` / `npm run lint:fix`.
5. **Tests** — backend uses `vitest` + `supertest` for unit and HTTP integration tests against the Express app; frontend uses `vitest` + React Testing Library + `jsdom` for component tests covering the form and the dropzone.
6. **Bonus — AI lint-fix skill** — a Claude Code skill at `.claude/skills/pre-commit/` runs ESLint across both projects, auto-fixes what it can, and resolves remaining issues by editing the offending files, then verifies with typecheck and tests.

## Libraries added

On top of the initial setup (`express`, `react`, `react-dom`, `dotenv`, `vite`, `nodemon`):

**Runtime**
- `multer` — handles `multipart/form-data` for file uploads on the backend.
- `react-dropzone` — drag-and-drop file picker for the form.
- `classnames` — small helper for conditional CSS class composition.

**Tooling**
- `typescript` + `tsx` + `@types/*` — migrated the project to TypeScript for type safety; `tsx` replaces `nodemon` to run the TS backend with watch mode.
- `concurrently` — runs the backend and frontend in a single `npm start` command.

**Testing**
- `vitest` — fast test runner that shares Vite config.
- `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom` — frontend component testing.
- `supertest` — backend HTTP integration testing against the Express app.

**Linting (AirBnb)**
- `eslint` + `eslint-config-airbnb` + `eslint-config-airbnb-typescript` — AirBnb style guide as required by the task.
- `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin` — TS support for ESLint.
- `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, `eslint-plugin-react`, `eslint-plugin-react-hooks` — peer plugins required by the AirBnb config.
