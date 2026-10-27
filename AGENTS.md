# AGENTS.md

Regras para agentes de IA e contribuidores deste repositório (app React Native/Expo + Web em TypeScript). Visão geral e comandos: [`README.md`](README.md).

## Contexto do projeto

- Stack: Expo 50, React Native 0.73, React 18, TypeScript, Jest 29. Sem biblioteca de estado ou UI: o app é uma tela só.
- Gerenciador de pacotes: **pnpm**. Não adicione `package-lock.json`/`yarn.lock` novos.
- Código em `src/`: `components/` (UI), `hooks/` (estado da tela), `lib/` (cálculo e formatação, sem React), `services/` (acesso aos preços). `scripts/` gera `data/precos.json`.
- O app também roda no Web (`pnpm web`); confira lá ao mudar a UI.
- Os preços são reais: médias de revenda da ANP, em `data/precos.json` (atualizado por `pnpm precos` e pelo workflow semanal). Nunca invente ou simule preços; cidade sem pesquisa da ANP só pode usar a cidade pesquisada mais próxima ou a média do estado/região, sempre com aviso na tela. Sem rede o app usa o arquivo embutido. Não invente backend nem chaves de API.

## Princípios

1. **DRY** — um conceito, um lugar. Extraia padrões repetidos (ex.: modais de extras com layout igual).
2. **KISS** — prefira a solução mais simples e legível.
3. **SOLID** — uma responsabilidade por módulo; componentes dependem de stores/serviços, não de detalhes internos.
4. **YAGNI** — implemente só o que foi pedido; sem features, flags ou abstrações especulativas.

## Qualidade de código

- **Limite de 180 linhas por arquivo novo ou alterado.** Se um arquivo crescer, extraia em vez de ultrapassar o limite.
- Regra de negócio e cálculos nas stores/utils, nunca dentro de JSX.
- Nomes descritivos e consistentes: componentes `PascalCase`, stores `nome.store.ts`, testes `nome.test.ts` em `__tests__/`.
- Comentários só para o "porquê" não óbvio; nunca para narrar o código.
- Tratamento de erro básico em I/O e parsing; não exponha detalhes internos ao usuário.
- Formatação: Prettier (`.prettierrc.js`) e ESLint (`.eslintrc.js`). Não commite warnings novos.
- Textos de UI em português do Brasil.
- Nunca versione segredos (keystores, `service-account-key.json`, chaves de API). O CI roda gitleaks.
- Não commite artefatos gerados: logs (`*.log`), `coverage/`, `build/`.

## Testes

- Todo código novo de lógica (stores, utils, services) precisa de teste unitário; bug fix começa por um teste que reproduz.
- Cobertura mínima global: **80%**. Dados de teste realistas (preços em R$, consumo em km/l).
- Antes de abrir PR:

```bash
pnpm lint
pnpm test
```

## Fluxo de desenvolvimento

- Branch a partir da principal; commits pequenos com mensagens claras (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- PR descreve o que mudou e como foi testado; só mergeia com o workflow **Validate** verde.
- Mudou comando, estrutura ou feature? Atualize o `README.md` no mesmo PR.

## Checklist do agente

- [ ] Mudança mínima e dentro do escopo pedido
- [ ] Arquivos ≤ 180 linhas, sem duplicação
- [ ] Testes adicionados/atualizados; `pnpm lint` e `pnpm test` passando
- [ ] Versão `.web.tsx` conferida quando aplicável
- [ ] README atualizado se necessário

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