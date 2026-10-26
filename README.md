# Etanol ou Gasolina? ⛽

App (Android, iOS e Web) que diz se compensa abastecer com **etanol** ou **gasolina**.

- Escolha estado e cidade: os preços vêm preenchidos com a **média de revenda da ANP** (dados reais, semanais).
- Ajuste os preços com o valor da bomba, se quiser.
- Opcional: informe o consumo (km/l) de cada combustível para comparar pelo custo por km. Sem o consumo, vale a regra dos 70%.

## Preços (ANP)

Fonte: [Levantamento de Preços de Combustíveis](https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas) (resumo semanal: Brasil, estados e municípios).

- `data/precos.json` é gerado por `pnpm precos` (`scripts/`), que baixa a planilha mais recente da ANP.
- O workflow `Atualizar preços ANP` roda toda segunda-feira e commita o arquivo.
- O app busca o JSON no GitHub; sem rede ou com resposta inválida, usa a cópia embutida.
- Só entram municípios pesquisados pela ANP, que tenham gasolina e etanol na semana.

## Estrutura

```
src/
  App.tsx              tela única
  components/          Seletor, CampoNumero, ResultadoCard
  hooks/               useLocalPrecos (estado da tela)
  lib/                 calculo.ts e precos.ts (sem React)
  services/            carregarPrecos (online + cópia embutida)
scripts/               download e conversão dos dados da ANP
data/precos.json       preços reais da última semana
```

## Comandos

```bash
pnpm install
pnpm start      # Expo
pnpm web        # versão web
pnpm test       # Jest (inclui smoke do App)
pnpm lint
pnpm precos     # atualiza data/precos.json
```

## Gerar APK (local)

Requer Android SDK (platform 34, build-tools 34, NDK 25.1, CMake 3.22.1) e JDK 17.

```bash
pnpm install
cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
# saída: android/app/build/outputs/apk/release/app-release.apk
```

O release usa a chave debug; use uma keystore própria para publicar. Os ícones em `assets/` são provisórios.
