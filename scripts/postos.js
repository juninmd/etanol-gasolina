// Converte a planilha de postos da ANP (revendas_lpc) em listas por UF.
const {ESTADOS, serialParaIso} = require('./anp');

const PRODUTOS = {'GASOLINA COMUM': 'gasolina', ETANOL: 'etanol'};
// Colunas da aba "POSTOS REVENDEDORES" (planilha revendas_lpc da ANP).
const COL_POSTO = {
  cnpj: 0,
  razao: 1,
  fantasia: 2,
  rua: 3,
  numero: 4,
  bairro: 6,
  municipio: 8,
  estado: 9,
  bandeira: 10,
  produto: 11,
  preco: 13,
  coleta: 14,
};

const endereco = (l) =>
  [
    [l[COL_POSTO.rua], l[COL_POSTO.numero]].filter(Boolean).join(', '),
    l[COL_POSTO.bairro],
  ]
    .filter(Boolean)
    .join(' - ');

/** Postos com gasolina comum e etanol hidratado, agrupados por UF. */
function montarPostos(linhas) {
  const inicio = linhas.findIndex((l) => l[0] === 'CNPJ');
  if (inicio < 0) {
    throw new Error('Cabeçalho da planilha de postos da ANP não encontrado');
  }
  const periodo = linhas
    .map((l) =>
      /PER[ÍI]ODO: (\d\d)\/(\d\d)\/(\d{4}) A (\d\d)\/(\d\d)\/(\d{4})/.exec(
        l[0] ?? '',
      ),
    )
    .find(Boolean);
  if (!periodo) {
    throw new Error('Período da planilha de postos não encontrado');
  }
  const semana = {
    inicio: `${periodo[3]}-${periodo[2]}-${periodo[1]}`,
    fim: `${periodo[6]}-${periodo[5]}-${periodo[4]}`,
  };

  const porCnpj = new Map();
  for (const l of linhas.slice(inicio + 1)) {
    const produto = PRODUTOS[l[COL_POSTO.produto]];
    const preco = l[COL_POSTO.preco];
    if (!produto || !ESTADOS[l[COL_POSTO.estado]] || !(preco > 0)) {
      continue;
    }
    const posto = porCnpj.get(l[COL_POSTO.cnpj]) ?? {
      uf: ESTADOS[l[COL_POSTO.estado]][0],
      nome: l[COL_POSTO.fantasia] || l[COL_POSTO.razao],
      bandeira: l[COL_POSTO.bandeira],
      endereco: endereco(l),
      municipio: l[COL_POSTO.municipio],
    };
    posto[produto] = preco;
    posto.coleta = serialParaIso(l[COL_POSTO.coleta]);
    porCnpj.set(l[COL_POSTO.cnpj], posto);
  }

  const porUf = {};
  for (const {uf, ...posto} of porCnpj.values()) {
    if (posto.gasolina && posto.etanol) {
      (porUf[uf] ??= []).push(posto);
    }
  }
  for (const lista of Object.values(porUf)) {
    lista.sort(
      (a, b) =>
        a.municipio.localeCompare(b.municipio, 'pt-BR') ||
        a.nome.localeCompare(b.nome, 'pt-BR'),
    );
  }
  return {semana, porUf};
}

module.exports = {montarPostos};
