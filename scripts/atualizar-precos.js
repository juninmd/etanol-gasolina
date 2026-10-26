// Baixa o resumo semanal mais recente da ANP e grava data/precos.json.
// Uso: node scripts/atualizar-precos.js
const fs = require('fs');
const path = require('path');
const {lerXlsx} = require('./xlsx');
const {montarDados} = require('./anp');

const PAGINA =
  'https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas';
const DESTINO = path.join(__dirname, '..', 'data', 'precos.json');

async function baixar(url, tipo) {
  const resposta = await fetch(url, {
    headers: {'User-Agent': 'etanol-gasolina'},
  });
  if (!resposta.ok) {
    throw new Error(`Falha ao baixar ${url}: HTTP ${resposta.status}`);
  }
  return tipo === 'texto'
    ? resposta.text()
    : Buffer.from(await resposta.arrayBuffer());
}

async function main() {
  const html = await baixar(PAGINA, 'texto');
  const links = [
    ...html.matchAll(/href="(https:[^"]*resumo_semanal_lpc[^"]*\.xlsx)"/g),
  ].map((m) => m[1]);
  if (!links.length) {
    throw new Error('Nenhum resumo semanal encontrado na página da ANP');
  }
  const dados = montarDados(lerXlsx(await baixar(links[0])), links[0]);
  fs.mkdirSync(path.dirname(DESTINO), {recursive: true});
  fs.writeFileSync(DESTINO, `${JSON.stringify(dados, null, 1)}\n`);
  console.log(
    `Preços de ${dados.semana.inicio} a ${dados.semana.fim} salvos em data/precos.json`,
  );
}

main().catch((erro) => {
  console.error(erro.message);
  process.exit(1);
});
