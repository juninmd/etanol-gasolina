// Baixa o resumo semanal mais recente da ANP e grava data/precos.json.
// Uso: node scripts/atualizar-precos.js
const fs = require('fs');
const path = require('path');
const {lerXlsx} = require('./xlsx');
const {montarDados} = require('./anp');
const {montarPostos} = require('./postos');
const MUNICIPIOS = require('../data/municipios.json').municipios;

const PAGINA =
  'https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas';
const DADOS = path.join(__dirname, '..', 'data');
const DESTINO = path.join(DADOS, 'precos.json');
const PASTA_POSTOS = path.join(DADOS, 'postos');

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

const linksDe = (html, nome) =>
  [
    ...html.matchAll(
      new RegExp(`href="(https:[^"]*${nome}[^"]*\\.xlsx)"`, 'g'),
    ),
  ].map((m) => m[1]);

async function main() {
  const html = await baixar(PAGINA, 'texto');
  const [resumo] = linksDe(html, 'resumo_semanal_lpc');
  const [revendas] = linksDe(html, 'revendas_lpc');
  if (!resumo || !revendas) {
    throw new Error('Planilhas semanais não encontradas na página da ANP');
  }
  const dados = montarDados(lerXlsx(await baixar(resumo)), resumo, MUNICIPIOS);
  fs.mkdirSync(PASTA_POSTOS, {recursive: true});
  fs.writeFileSync(DESTINO, `${JSON.stringify(dados)}\n`);

  const {semana, porUf} = montarPostos(
    lerXlsx(await baixar(revendas))['POSTOS REVENDEDORES'],
  );
  for (const [uf, postos] of Object.entries(porUf)) {
    fs.writeFileSync(
      path.join(PASTA_POSTOS, `${uf}.json`),
      `${JSON.stringify({semana, postos})}\n`,
    );
  }
  console.log(
    `Médias de ${dados.semana.inicio} a ${dados.semana.fim} e ` +
      `${Object.values(porUf).flat().length} postos em ${
        Object.keys(porUf).length
      } UFs.`,
  );
}

main().catch((erro) => {
  console.error(erro.message);
  process.exit(1);
});
