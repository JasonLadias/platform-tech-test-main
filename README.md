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
