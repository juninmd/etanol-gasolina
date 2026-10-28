// Baixa o resumo semanal mais recente da ANP e grava data/precos.json, os
// postos por UF e a semana no histórico SQLite (data/historico.sqlite).
// Uso: node scripts/atualizar-precos.js [--semanas N]
//   --semanas N: também registra no histórico as N semanas mais recentes.
const fs = require('fs');
const path = require('path');
const {lerXlsx} = require('./xlsx');
const {montarDados} = require('./anp');
const {montarPostos} = require('./postos');
const {abrirHistorico, registrarSemana} = require('./historico');
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

/** Registra no histórico as semanas mais recentes que ainda não estão lá. */
async function preencherHistorico(db, resumos, semanas) {
  for (const link of resumos.slice(0, semanas)) {
    try {
      const dados = montarDados(lerXlsx(await baixar(link)), link, MUNICIPIOS);
      if (registrarSemana(db, dados)) {
        console.log(`Histórico: semana ${dados.semana.inicio} registrada.`);
      }
    } catch (erro) {
      console.warn(`Histórico: ${link} ignorado (${erro.message}).`);
    }
  }
}

async function main() {
  const indice = process.argv.indexOf('--semanas');
  const semanas = indice > 0 ? Number(process.argv[indice + 1]) || 1 : 1;
  const html = await baixar(PAGINA, 'texto');
  const resumos = linksDe(html, 'resumo_semanal_lpc');
  const [resumo] = resumos;
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
  const db = abrirHistorico();
  try {
    registrarSemana(db, dados);
    await preencherHistorico(db, resumos, semanas);
  } finally {
    db.close();
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
