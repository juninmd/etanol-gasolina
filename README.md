# Etanol ou Gasolina? 🚗⛽

App multiplataforma (Android, iOS e Web) que diz se compensa abastecer com **etanol** ou **gasolina**, usando a regra dos 70% e o consumo real de cada veículo.

## ✨ Funcionalidades

| Área | O que faz |
| --- | --- |
| **Calculadora** | Compara preços pela regra dos 70% e pelo consumo (km/l) de cada combustível, com recomendação. |
| **Postos** | Lista e mapa, filtro de promoções, histórico de preços, comentários e avaliações. |
| **Favoritos** | Postos favoritos e detalhes. |
| **Garagem** | Vários veículos, registro de abastecimentos, estatísticas e economia. |
| **Insights de mercado** | Análise de preços entre postos. |
| **Planejador de viagem** | Custo estimado de uma viagem por combustível. |
| **Gamificação** | Pontos, níveis e badges. |
| **Extras (modais)** | Churrascômetro, Roleta da Sorte, Batalha de Postos, Posto Tycoon, Pé na Tábua, Detector de Cilada, Calculadora de Rolê, entre outros em `src/components/`. |
| **Tema** | Claro/escuro. |

> Postos, preços e comentários são **dados mock** (sem backend). Atualização em tempo real e geofencing estão desabilitados em `src/stores/stations.store.ts`.

## 🧱 Stack

- Expo 50 · React Native 0.73 · React 18 · `react-native-web`
- MobX 6 + `mobx-react` (stores com decorators)
- React Navigation 6 (tabs + stack)
- UI Kitten 5 (Eva Design)
- TypeScript 5 · Jest 29 · ESLint · Prettier
- Build Android via EAS (`eas.json`); deploy web no Netlify (`netlify.toml`)

## 🚀 Começando

Requisitos: Node.js 18+ e pnpm (versão em `packageManager` no `package.json`).

```bash
pnpm install

pnpm start            # Expo dev server
pnpm android          # roda no Android (expo run:android)
pnpm ios              # roda no iOS (expo run:ios)
pnpm web              # roda a versão web
pnpm build            # exporta o web para ./build
```

### Scripts de qualidade

```bash
pnpm test                     # Jest
pnpm test -- --coverage       # cobertura (meta: ≥ 80%)
pnpm lint                     # ESLint
```

## 🗂️ Estrutura

```
src/
├── App.tsx / App.web.tsx   # raiz (provider de stores, tema, rotas)
├── routes/                 # tabs (Calculadora, Postos, Favoritos, Garagem) + stack
├── containers/             # telas: home, stations, station-details, favorites,
│                           #        garage, market-insights, trip-planner
├── components/             # modais, cards, gráficos e widgets reutilizáveis
├── stores/                 # homeStore, stationsStore, garageStore, themeStore
│   └── __tests__/          # testes unitários das stores
├── services/               # api.service.ts
└── utils/
```

Telas com sufixo `.web.tsx` substituem a versão nativa no Web.

## 🧠 Arquitetura

- **Estado:** quatro stores MobX exportadas por `src/stores/index.tsx`.
  - `homeStore`: entradas e cálculo da calculadora.
  - `stationsStore`: postos, mercado, comentários, badges e economia.
  - `garageStore`: veículos e abastecimentos.
  - `themeStore`: tema claro/escuro.
- **Telas** consomem as stores com `inject`/`observer`; regra de negócio fica nas stores, não nos componentes.
- **Navegação:** tabs inferiores customizadas com UI Kitten; telas secundárias em stack.

## 🗺️ Google Maps (Android)

Configure a chave em `android/app/src/main/AndroidManifest.xml`:

```xml
<meta-data android:name="com.google.android.geo.API_KEY" android:value="SUA_CHAVE_AQUI"/>
```

Nunca versione chaves reais; o CI roda gitleaks em cada push.

## 📦 Build e publicação

```bash
pnpm build:android:preview   # APK interno (EAS)
pnpm build:android           # AAB de produção (EAS)
```

Guias detalhados: [`APK_BUILD_INSTRUCTIONS.md`](APK_BUILD_INSTRUCTIONS.md), [`EXPO_SETUP.md`](EXPO_SETUP.md), [`GITHUB_SECRETS_SETUP.md`](GITHUB_SECRETS_SETUP.md), [`PLAY_STORE_CHECKLIST.md`](PLAY_STORE_CHECKLIST.md), [`PRODUCTION_CHECKLIST.md`](PRODUCTION_CHECKLIST.md) e [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md).

## 🔄 CI

- **Validate** (PR e `main`): workflow reutilizável de lint/testes.
- **Security Scan** (push em `main`): gitleaks.
- **Release Drafter**: rascunho de release a partir dos PRs.

## 🤝 Contribuindo

Siga as regras de [`AGENTS.md`](AGENTS.md) (DRY, KISS, arquivos ≤ 180 linhas, testes). Fluxo: branch → commits claros → PR com testes passando.

## 📄 Licença

Privado — uso pessoal.

## Gerar APK (local)

Requer Android SDK (platform 34, build-tools 34, NDK 25.1, CMake 3.22.1) e JDK 17.

```bash
pnpm install
cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
# saída: android/app/build/outputs/apk/release/app-release.apk
```

O release usa a chave debug; troque por uma keystore própria antes de publicar. Os ícones em `assets/` são placeholders.
