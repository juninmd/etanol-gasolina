# AGENTS.md

Etanol ou Gasolina?: a single-screen Expo / React Native app (Android, iOS and web) that compares ethanol and gasoline prices using ANP retail averages for all Brazilian municipalities. Overview and user docs: [`README.md`](README.md).

## Stack

- Expo 50, React Native 0.73, React 18.2, TypeScript, Jest 29
- No state or UI library. The app is one screen
- Package manager: pnpm (`pnpm-lock.yaml`). Do not add `package-lock.json` or `yarn.lock`

## Commands

- Install: `pnpm install`
- Start: `pnpm start`. Also `pnpm web`, `pnpm android`, `pnpm ios`
- Test: `pnpm test` (Jest)
- Lint: `pnpm lint` (ESLint, config in `.eslintrc.js`). Format with Prettier (`.prettierrc.js`)
- Web build: `pnpm build` (`expo export -p web --output-dir build`)
- Price data refresh: `pnpm precos` (`scripts/atualizar-precos.js`, also run weekly by `.github/workflows/atualizar-precos.yml`)
- Native builds: `pnpm build:android`, `pnpm build:android:preview` (EAS)

## Structure

- `src/components/`: UI. `src/hooks/`: screen state. `src/lib/`: calculation and formatting, no React
- `src/services/`: access to price data. `src/__tests__/`: app-level tests. Unit tests sit in `__tests__/` next to their module
- `scripts/`: data pipeline (ANP, IBGE municipalities, gas stations, history). Generates `data/precos.json`
- `data/`: bundled price and municipality data (`precos.json`, `municipios.json`, `postos/`, `historico.sqlite`)
- `android/`, `ios/`: native projects. `public/`: web shell

## Conventions

- DRY, KISS, SOLID, YAGNI. One concept, one place. Implement only what was asked.
- Max 180 lines per new or changed file. If a file grows past that, extract it.
- Business rules and calculations live in stores or utils, never inside JSX.
- Names: components `PascalCase`, stores `nome.store.ts`, tests `nome.test.ts` in `__tests__/`.
- Comments only for a non-obvious "why". Never narrate the code.
- Basic error handling on I/O and parsing. Do not expose internal details to the user.
- UI text is pt-BR. Commit prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`.
- Do not commit new ESLint or Prettier warnings.
- Tests: every new logic module (stores, utils, services) needs a unit test. A bug fix starts with a test that reproduces it. Target: 80% global coverage. Use realistic data (R$ prices, km/l consumption).
- Before a PR: `pnpm lint` and `pnpm test`, both passing. Update `README.md` in the same PR when commands, structure or features change.

## Gotchas

- Prices are real ANP averages. Never invent or simulate prices. A city without an ANP survey may only use the nearest surveyed city or the state/region average, and the screen must say so.
- Offline, the app uses the bundled file. Do not add a backend or API keys.
- Never commit secrets: release keystores, `service-account-key.json`, API keys. `android/app/debug.keystore` is the committed debug key. CI runs gitleaks (`security.yml`).
- Do not commit generated artifacts: logs (`*.log`), `coverage/`, `build/`.
- Jest does not enforce the 80% threshold in `jest.config.js`. Check coverage manually when a change touches logic.

<!-- base-actions-main-policy -->
## GitHub Actions — padrão obrigatório (@main)

- Referencie as actions internas sempre pelo branch, nunca por SHA:
  - `uses: juninmd/base-actions/<action>@main`
  - `uses: juninmd/base-actions/.github/workflows/<arquivo>.yml@main`
- Não fixe `@<sha>` em `juninmd/base-actions`: a atualização é centralizada no
  `main` e passa a valer no próximo run.
- PRs cujos checks não iniciam por billing/spending limit são mesclados pelo bot central
  `juninmd/base-actions/.github/workflows/auto-merge-billing-blocked.yml`.
  Para impedir o merge automático de um PR, aplique a label `do-not-merge`.
