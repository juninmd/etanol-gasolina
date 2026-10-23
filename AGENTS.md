# AGENTS.md

Regras para agentes de IA e contribuidores deste repositório (app React Native/Expo + Web em TypeScript). Visão geral e comandos: [`README.md`](README.md).

## Contexto do projeto

- Stack: Expo 50, React Native 0.73, React 18, MobX 6 (decorators), React Navigation 6, UI Kitten 5, Jest 29.
- Gerenciador de pacotes: **pnpm**. Não adicione `package-lock.json`/`yarn.lock` novos.
- Código em `src/`: `containers/` (telas), `components/` (UI reutilizável), `stores/` (estado e regra de negócio), `services/`, `utils/`, `routes/`.
- Arquivos `*.web.tsx` sobrescrevem a versão nativa no Web; ao mudar uma tela, verifique as duas.
- Dados de postos/preços são mock. Não invente backend nem chaves de API.

## Princípios

1. **DRY** — um conceito, um lugar. Extraia padrões repetidos (ex.: modais de extras com layout igual).
2. **KISS** — prefira a solução mais simples e legível.
3. **SOLID** — uma responsabilidade por módulo; componentes dependem de stores/serviços, não de detalhes internos.
4. **YAGNI** — implemente só o que foi pedido; sem features, flags ou abstrações especulativas.

## Qualidade de código

- **Limite de 180 linhas por arquivo novo ou alterado.** Alguns arquivos legados excedem (ex.: `containers/home/index.tsx`, `stores/stations.store.ts`); ao tocá-los, extraia em vez de crescer.
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
