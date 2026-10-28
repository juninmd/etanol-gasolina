// Histórico semanal de preços em SQLite (data/historico.sqlite).
// Usa node:sqlite, que exige Node 22.5+.
const path = require('path');

const ARQUIVO = path.join(__dirname, '..', 'data', 'historico.sqlite');

const ESQUEMA = `
CREATE TABLE IF NOT EXISTS semanas (
  inicio TEXT PRIMARY KEY,
  fim TEXT NOT NULL
);
-- uf e cidade vazios: média do Brasil; só cidade vazia: média do estado.
CREATE TABLE IF NOT EXISTS precos (
  inicio TEXT NOT NULL REFERENCES semanas (inicio),
  uf TEXT NOT NULL,
  cidade TEXT NOT NULL,
  gasolina REAL NOT NULL,
  etanol REAL NOT NULL,
  postos INTEGER,
  PRIMARY KEY (inicio, uf, cidade)
) WITHOUT ROWID;
-- Diferença para a semana anterior pesquisada do mesmo local.
CREATE VIEW IF NOT EXISTS variacao AS
SELECT inicio, uf, cidade, gasolina, etanol,
  ROUND(gasolina - LAG(gasolina) OVER semanal, 2) AS var_gasolina,
  ROUND(etanol - LAG(etanol) OVER semanal, 2) AS var_etanol,
  ROUND((gasolina / LAG(gasolina) OVER semanal - 1) * 100, 2) AS var_gasolina_pct,
  ROUND((etanol / LAG(etanol) OVER semanal - 1) * 100, 2) AS var_etanol_pct
FROM precos
WINDOW semanal AS (PARTITION BY uf, cidade ORDER BY inicio);
`;

function abrirHistorico(caminho = ARQUIVO) {
  const {DatabaseSync} = require('node:sqlite');
  const db = new DatabaseSync(caminho);
  db.exec(ESQUEMA);
  return db;
}

/** Linhas {uf, cidade, gasolina, etanol, postos} só com preço medido pela ANP. */
function linhasDaSemana(dados) {
  const linhas = [{uf: '', cidade: '', ...dados.brasil, postos: null}];
  for (const estado of dados.estados) {
    if (estado.base !== 'regiao') {
      linhas.push({
        uf: estado.uf,
        cidade: '',
        gasolina: estado.gasolina,
        etanol: estado.etanol,
        postos: null,
      });
    }
    for (const m of estado.municipios) {
      if (m.gasolina !== undefined) {
        linhas.push({
          uf: estado.uf,
          cidade: m.nome,
          gasolina: m.gasolina,
          etanol: m.etanol,
          postos: m.postos ?? null,
        });
      }
    }
  }
  return linhas;
}

/**
 * Grava a semana de `dados` (formato de data/precos.json).
 * Devolve false, sem alterar o arquivo, se a semana já estava registrada.
 */
function registrarSemana(db, dados) {
  const {inicio, fim} = dados.semana;
  if (db.prepare('SELECT 1 FROM semanas WHERE inicio = ?').get(inicio)) {
    return false;
  }
  const inserir = db.prepare('INSERT INTO precos VALUES (?, ?, ?, ?, ?, ?)');
  db.exec('BEGIN');
  try {
    db.prepare('INSERT INTO semanas VALUES (?, ?)').run(inicio, fim);
    for (const l of linhasDaSemana(dados)) {
      inserir.run(inicio, l.uf, l.cidade, l.gasolina, l.etanol, l.postos);
    }
    db.exec('COMMIT');
  } catch (erro) {
    db.exec('ROLLBACK');
    throw erro;
  }
  return true;
}

module.exports = {ARQUIVO, abrirHistorico, registrarSemana, linhasDaSemana};
