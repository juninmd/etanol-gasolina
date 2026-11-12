<div align="center">

<img src="assets/icon.png" width="96" alt="Ícone do app: uma gota branca sobre fundo verde" />

# Etanol ou Gasolina?

**Descubra em segundos se compensa abastecer com etanol ou gasolina — com preços da ANP para as 5.571 cidades do Brasil, medidos onde há pesquisa e estimados onde não há.**

</div>

App feito em Expo/React Native que roda em Android, iOS e web. Você escolhe estado e cidade, os campos vêm preenchidos com a média de revenda da ANP da semana, e o app compara pela regra dos 70% ou pelo custo por quilômetro quando você informa o consumo do seu carro. Também lista os postos mais baratos pesquisados na cidade.

**Índice:** [O que faz](#o-que-faz) · [Como o cálculo funciona](#como-o-cálculo-funciona) · [Dados da ANP](#dados-da-anp) · [Rodar o app](#rodar-o-app) · [Build](#build) · [Arquitetura](#arquitetura) · [Privacidade](#privacidade-e-rede) · [Testes e CI](#testes-e-ci) · [Limitações](#limitações) · [Licença](#licença)

## O que faz

- **Cobertura nacional.** Lista todos os municípios do IBGE (5.571 no total) e usa o preço da ANP quando a cidade foi pesquisada na semana.
- **Preenchimento automático.** Ao abrir, usa a média nacional; ao escolher o estado, a média do estado; ao escolher a cidade, o preço dela.
- **Estimativa transparente.** Se a cidade não foi pesquisada, usa a cidade pesquisada mais próxima do mesmo estado (até 150 km) e avisa que é estimativa; sem vizinha no raio, cai para a média do estado ou da região.
- **Dois critérios.** Sem consumo informado, vale a regra dos 70%. Com km/l dos dois combustíveis, compara o custo real por quilômetro.
- **Postos.** Mostra até 10 postos da cidade, ordenados pelo custo efetivo; tocar em um posto joga os preços dele na comparação.
- **Entrada brasileira.** Aceita `5,89`, `5.89` e `1.234,50`; a saída usa vírgula decimal e `R$`.

## Como o cálculo funciona

A regra parte de uma premissa: o etanol rende cerca de **70%** do que a gasolina rende por litro. O código chama esse limite de `LIMITE_ETANOL = 0.7` em `src/lib/calculo.ts`.

```text
razão = preço do etanol / preço da gasolina

razão <= 0,70  ->  etanol compensa
razão >  0,70  ->  gasolina compensa
```

Quando os dois consumos são informados, o app troca a regra pelo custo por quilômetro:

```text
custo/km = preço do litro / consumo (km/l)
```

O combustível com menor custo por km vence, e a economia exibida é `(1 − menor custo / maior custo) × 100`.

Exemplos reais dos testes (`src/lib/__tests__/calculo.test.ts`):

| Entrada | Resultado |
| --- | --- |
| Gasolina `6,50`, etanol `4,20` | Etanol — razão `0,646`, critério `regra70`. |
| Gasolina `6,50`, etanol `4,90` | Gasolina — razão `0,754`. |
| Gasolina `6,50`, etanol `4,90`, 12 km/l e 9 km/l | Gasolina — `R$ 0,5417/km` contra `R$ 0,5444/km`, critério `consumo`. |
| Só o consumo da gasolina informado | Volta para `regra70`; consumo incompleto é ignorado. |

Empates exatos de 70% são tratados com tolerância de ponto flutuante (`1e-9`) e ficam com o etanol. A calculadora nunca inventa preço: sem dois preços válidos, o resultado é `null` e a tela pede os valores.

## Dados da ANP

A fonte é o [Levantamento de Preços de Combustíveis](https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas), no resumo semanal de revenda (Brasil, estados, regiões e municípios) e na planilha de postos revendedores.

O script `scripts/atualizar-precos.js` faz o caminho completo:

1. Baixa a página da ANP e encontra os `.xlsx` de `resumo_semanal_lpc` e `revendas_lpc`.
2. Converte as abas `ESTADOS`, `MUNICIPIOS`, `REGIOES` e `BRASIL` em `data/precos.json`.
3. Converte a aba `POSTOS REVENDEDORES` em um JSON por UF em `data/postos/`, mantendo só postos com **gasolina e etanol** na mesma semana.
4. Registra a semana em `data/historico.sqlite` e, com `--semanas N`, preenche também as semanas anteriores.
5. Junta os nomes e as coordenadas do IBGE (`data/municipios.json`) aos preços, calculando a cidade de referência mais próxima em até 150 km.

O workflow **Atualizar preços ANP** roda todo dia às `12:17` UTC. A ANP publica uma vez por semana, em dia variável; o job só commita `data/` quando há mudança. Ele executa o script com `npx -y node@22` porque `node:sqlite` exige Node 22.5+.

No app, `src/services/precos.service.ts` busca `data/precos.json` no `master` a cada abertura, com timeout de 8 s. A resposta só é aceita se passar na validação de formato **e** se a semana for igual ou mais nova que a cópia embutida no bundle. Sem rede, JSON inválido ou semana mais antiga, usa a cópia local. A lista de postos (`data/postos/<UF>.json`) só existe online.

Semana, fonte e avisos aparecem na própria tela; quando o preço não é da cidade escolhida, o app diz de onde veio.

### Histórico

`data/historico.sqlite` guarda a série semanal dos preços **medidos** (Brasil, estados com pesquisa própria e cidades pesquisadas). A view `variacao` calcula a diferença em R$ e em % para a semana anterior do mesmo local.

```bash
node --no-warnings -e "const {abrirHistorico}=require('./scripts/historico');
const db=abrirHistorico();
console.table(db.prepare(\"SELECT inicio, gasolina, etanol, var_gasolina_pct, var_etanol_pct FROM variacao WHERE uf='SP' AND cidade='Campinas' ORDER BY inicio DESC LIMIT 8\").all())"
```

O histórico é consultado por script; o app não tem tela de séries históricas.

## Rodar o app

Pré-requisitos: Node.js, [pnpm](https://pnpm.io) (o projeto declara `pnpm@10.34.5`) e, para builds nativos, Android SDK/Xcode.

```bash
pnpm install
pnpm start      # Expo (dev client / QR code)
pnpm web        # versão web no navegador
pnpm android    # expo run:android
pnpm ios        # expo run:ios (macOS)
```

Scripts de `package.json`:

| Comando | O que faz |
| --- | --- |
| `pnpm start` | `expo start`. |
| `pnpm android` / `pnpm ios` | Build e execução nativos via `expo run:*`. |
| `pnpm web` | `expo start --web`. |
| `pnpm build` | `expo export -p web --output-dir build` — site estático em `build/`. |
| `pnpm build:android` | `eas build --platform android` (perfil `production`). |
| `pnpm build:android:preview` | EAS no perfil `preview`, que gera APK. |
| `pnpm test` | Jest. |
| `pnpm lint` | ESLint. |
| `pnpm precos` | Atualiza os dados da ANP (Node 22.5+). |

Não há `.env` nem variável de ambiente obrigatória: as URLs dos JSON são constantes em `src/services/`. Para atualizar os preços localmente:

```bash
pnpm precos
pnpm precos -- --semanas 12   # registra também as 12 semanas mais recentes no SQLite
```

## Build

### Android local

O `android/build.gradle` usa `compileSdkVersion 34`, `targetSdkVersion 34`, `buildToolsVersion 34.0.0`, `minSdkVersion 23` e NDK `25.1.8937393`. O wrapper do Gradle está versionado no repositório.

```bash
pnpm install
cd android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
# saída: android/app/build/outputs/apk/release/app-release.apk
```

O build de release está assinado com a **keystore de debug** versionada em `android/app/debug.keystore` (`signingConfig signingConfigs.debug`). Isso serve para testar, não para publicar: gere uma keystore própria antes de distribuir.

Para EAS:

```bash
pnpm build:android:preview    # APK, distribuição interna
pnpm build:android            # AAB de produção
```

O `eas.json` define `development` (dev client), `preview` (APK) e `production` (AAB). O submit de produção aponta para `./service-account-key.json` e para a track `internal`; esse arquivo não está no repositório.

### iOS

`pnpm ios` exige macOS com Xcode. O `app.json` define `bundleIdentifier: com.etanol.gasolina`. Não há script EAS de iOS no `package.json`; para distribuir, configure o build no EAS.

### Web

```bash
pnpm build
# publica build/ (netlify.toml já aponta publish = "build")
```

O `netlify.toml` usa `pnpm build` para produção. O bloco `[dev]` ainda chama `yarn start`; para desenvolvimento local, prefira `pnpm web`.

## Arquitetura

```text
src/
  App.tsx                 tela única (seletores, campos, resultado, postos)
  components/             Seletor, CampoNumero, ResultadoCard, ListaPostos
  hooks/
    useLocalPrecos.ts     carrega preços, estado/cidade e valores digitados
    usePostos.ts          postos da UF filtrando pela cidade
  lib/
    calculo.ts            regra dos 70%, custo por km, parsing numérico
    precos.ts             validação do JSON, resolução de preço e formatação
    postos.ts             validação e ranking de postos
  services/
    precos.service.ts     fetch + fallback para a cópia embutida
    postos.service.ts     fetch por UF com cache em memória
  theme.ts                cores claro/escuro

scripts/
  atualizar-precos.js     orquestra download, parsing e gravação
  anp.js                  resumo semanal -> estados/cidades
  cidades.js              IBGE + vizinha mais próxima (150 km)
  postos.js               planilha de revendas -> JSON por UF
  historico.js            schema e série semanal em node:sqlite
  xlsx.js                 leitura de XLSX sem dependência externa

data/
  precos.json             médias da semana
  postos/<UF>.json        postos pesquisados, por estado
  municipios.json         nomes e coordenadas do IBGE
  historico.sqlite        série semanal e view de variação
```

O fluxo é curto: `useLocalPrecos` pede os preços, preenche os campos e `App.tsx` chama `compararCombustiveis` a cada tecla. `ResultadoCard` só renderiza o veredito; `ListaPostos` recebe a cidade e usa `postosDaCidade`, que normaliza o nome do município (sem acento, caixa ou hífen) e ordena por `custoEfetivo`.

## Privacidade e rede

- O `AndroidManifest` do Expo só concede `android.permission.INTERNET`; permissões de armazenamento, sobreposição e vibração são explicitamente removidas com `tools:node="remove"`. O app **não** pede localização, câmera ou contatos.
- As únicas chamadas de rede são dois `GET` em `raw.githubusercontent.com`: `data/precos.json` e `data/postos/<UF>.json` do próprio repositório.
- Não há login, analytics, anúncios, crash reporting ou backend próprio. Os valores digitados ficam em memória e não são persistidos.
- A cópia de preços embutida no bundle garante que a comparação funcione offline; a lista de postos fica indisponível sem rede.

> [!IMPORTANT]
> O `PRIVACY_POLICY.md` do repositório descreve recursos que o app **não** implementa — mapa, localização, favoritos, histórico de abastecimentos e dados de veículos. Antes de publicar em loja, alinhe a política ao que o código realmente faz (INTERNET, preços da ANP e nenhuma coleta pessoal).

## Testes e CI

```bash
pnpm test     # Jest
pnpm lint     # ESLint
```

A suíte cobre cálculo, validação de preços, postos e um smoke do `App`:

```text
src/lib/__tests__/calculo.test.ts
src/lib/__tests__/precos.test.ts
src/lib/__tests__/postos.test.ts
src/services/__tests__/precos.service.test.ts
src/services/__tests__/postos.service.test.ts
src/__tests__/app.smoke.test.tsx
src/components/__tests__/ListaPostos.test.tsx
scripts/__tests__/anp.test.js
scripts/__tests__/cidades.test.js
scripts/__tests__/historico.test.js
scripts/__tests__/xlsx.test.js
```

| Workflow | O que faz |
| --- | --- |
| `atualizar-precos.yml` | Diário às `12:17` UTC; baixa a ANP e commita `data/` só quando muda. |
| `validate.yml` | Validação de PR/push pelo workflow reutilizável de `juninmd/base-actions`. |
| `sast.yml` | Semgrep em `main`/`master` e sob demanda. |
| `security.yml` | Varredura de segurança no push. |
| `release-drafter.yml` | Mantém o rascunho de release a partir de PRs e pushes. |
| `dependabot-auto-merge.yml` | Auto-merge de PRs do Dependabot com checks verdes. |

## Limitações

- **Preço médio não é preço de bomba.** A ANP publica médias por município; o posto da esquina pode cobrar diferente. Os campos são editáveis justamente para isso.
- **Cobertura semanal parcial.** A ANP não pesquisa todas as cidades toda semana. Quando não pesquisa, o app usa a cidade mais próxima (até 150 km), a média do estado ou a da região — sempre com aviso na tela.
- **Defasagem.** Os dados são semanais; a data da semana aparece no rodapé da tela. O workflow diário só antecipa a chegada da planilha.
- **Histórico sem interface.** `historico.sqlite` é consultado por script; não há gráfico nem comparação de semanas no app.
- **Web depende do GitHub raw.** Sem rede, a web e o app móvel usam os preços embutidos no bundle; a lista de postos some.
- **Ícones provisórios.** Os arquivos em `assets/` são placeholders; o release Android usa a keystore de debug.
- **Base antiga.** Expo SDK 50 / React Native 0.73.6 são de 2024; atualizar implica revisar dependências e o build nativo.
- **Política de privacidade desatualizada**, como descrito acima.

## Licença

Não há arquivo de licença neste repositório. O código e os dados estão publicados sem licença de uso declarada; para reutilizar, procure o autor. Os dados da ANP e do IBGE pertencem aos órgãos de origem e seguem suas próprias condições de uso.
