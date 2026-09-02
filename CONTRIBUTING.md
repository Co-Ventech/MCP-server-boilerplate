# Contributing

## Setup

```bash
npm install
npm run build
npm test
```

## Running the inspector

```bash
npm run build
npm run inspect
```

## Making changes

- Add a tool by creating a file under `src/tools/` and adding one import/entry line to `src/tools/index.ts`.
- Keep `src/tools/*.ts` free of side effects so they stay easy to unit test.
- Run `npm test` before opening a pull request; the end-to-end test in `test/server.test.js` must pass.

## Pull requests

- Keep the diff focused on one change.
- Describe what changed and why in the PR description.
- Make sure `npm run build` and `npm test` both pass.
