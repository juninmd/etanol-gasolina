# Etanol ou Gasolina? ⛽

App (Android, iOS e Web) que diz se compensa abastecer com **etanol** ou **gasolina**.

- Escolha estado e cidade (**todas as 5.571 cidades do Brasil**): os preços vêm preenchidos com a **média de revenda da ANP** (dados reais, semanais).
- Ajuste os preços com o valor da bomba, se quiser.
- Opcional: informe o consumo (km/l) de cada combustível para comparar pelo custo por km. Sem o consumo, vale a regra dos 70%.

## Preços (ANP)

Fonte: [Levantamento de Preços de Combustíveis](https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas) (resumo semanal: Brasil, estados e municípios).

- `pnpm precos` (`scripts/`) baixa as duas planilhas semanais da ANP: o resumo (médias) vira `data/precos.json` e a lista de postos vira `data/postos/<UF>.json`.
- O workflow `Atualizar preços ANP` roda toda segunda-feira e commita `data/`.
- O app busca os JSON no GitHub; sem rede ou com resposta inválida, usa a cópia embutida das médias. A lista de postos só existe online.
- Ao escolher uma cidade, o app lista os postos mais baratos pesquisados pela ANP (nome, bandeira, endereço e os dois preços); tocar em um posto usa os preços dele na comparação.
- A ANP não pesquisa todas as cidades: cerca de 400 por semana têm gasolina e etanol. Para cada uma das demais o app usa os preços da **cidade pesquisada mais próxima do mesmo estado** (até 150 km, calculada pelas coordenadas do IBGE) e avisa que é **estimativa**. Sem cidade pesquisada por perto, usa a média do estado; estado sem pesquisa completa (ex.: Amapá) usa a média da região. Nenhum preço é inventado.
- A lista de cidades e coordenadas é do IBGE (`data/municipios.json`, estática); o script junta a ela os preços da ANP e a referência de cada cidade.
- Postos só entram se tiverem gasolina e etanol na semana.

## Estrutura

```
src/
  App.tsx              tela única
  components/          Seletor, CampoNumero, ResultadoCard
  hooks/               useLocalPrecos (estado da tela)
  lib/                 calculo.ts e precos.ts (sem React)
  services/            preços (online + cópia embutida) e postos (online)
scripts/               download e conversão dos dados da ANP
data/precos.json       médias da última semana: Brasil, estados e todas as cidades
data/municipios.json   cidades por UF (IBGE)
data/postos/<UF>.json  postos pesquisados pela ANP, por estado
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
