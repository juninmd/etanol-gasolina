// Converte o resumo semanal da ANP (abas ESTADOS, MUNICIPIOS e BRASIL) em JSON.
const ESTADOS = {
  ACRE: ['AC', 'Acre'],
  ALAGOAS: ['AL', 'Alagoas'],
  AMAPA: ['AP', 'Amapá'],
  AMAZONAS: ['AM', 'Amazonas'],
  BAHIA: ['BA', 'Bahia'],
  CEARA: ['CE', 'Ceará'],
  'DISTRITO FEDERAL': ['DF', 'Distrito Federal'],
  'ESPIRITO SANTO': ['ES', 'Espírito Santo'],
  GOIAS: ['GO', 'Goiás'],
  MARANHAO: ['MA', 'Maranhão'],
  'MATO GROSSO': ['MT', 'Mato Grosso'],
  'MATO GROSSO DO SUL': ['MS', 'Mato Grosso do Sul'],
  'MINAS GERAIS': ['MG', 'Minas Gerais'],
  PARA: ['PA', 'Pará'],
  PARAIBA: ['PB', 'Paraíba'],
  PARANA: ['PR', 'Paraná'],
  PERNAMBUCO: ['PE', 'Pernambuco'],
  PIAUI: ['PI', 'Piauí'],
  'RIO DE JANEIRO': ['RJ', 'Rio de Janeiro'],
  'RIO GRANDE DO NORTE': ['RN', 'Rio Grande do Norte'],
  'RIO GRANDE DO SUL': ['RS', 'Rio Grande do Sul'],
  RONDONIA: ['RO', 'Rondônia'],
  RORAIMA: ['RR', 'Roraima'],
  'SANTA CATARINA': ['SC', 'Santa Catarina'],
  'SAO PAULO': ['SP', 'São Paulo'],
  SERGIPE: ['SE', 'Sergipe'],
  TOCANTINS: ['TO', 'Tocantins'],
};

const PRODUTOS = {'GASOLINA COMUM': 'gasolina', 'ETANOL HIDRATADO': 'etanol'};
const CABECALHO = 'DATA INICIAL';

const serialParaIso = (serial) =>
  new Date(Date.UTC(1899, 11, 30) + serial * 86400000)
    .toISOString()
    .slice(0, 10);

// Posição das colunas em cada aba: estado, cidade e a coluna do produto.
const COLUNAS = {
  ESTADOS: {local: 3, cidade: null, produto: 4},
  MUNICIPIOS: {local: 2, cidade: 3, produto: 4},
  BRASIL: {local: 2, cidade: null, produto: 3},
};

/** Linhas da aba após o cabeçalho, como {inicio, fim, local, cidade, produto, postos, preco}. */
function lerAba(linhas, {local, cidade, produto}) {
  const inicio = linhas.findIndex((l) => l[0] === CABECALHO);
  if (inicio < 0) {
    throw new Error('Cabeçalho da planilha da ANP não encontrado');
  }
  return linhas
    .slice(inicio + 1)
    .filter((l) => typeof l[0] === 'number' && PRODUTOS[l[produto]])
    .map((l) => ({
      inicio: l[0],
      fim: l[1],
      local: l[local],
      cidade: cidade === null ? null : l[cidade],
      produto: PRODUTOS[l[produto]],
      postos: l[produto + 1],
      preco: l[produto + 3],
    }))
    .filter((l) => Number.isFinite(l.preco) && l.preco > 0);
}

function agrupar(registros, chave) {
  const mapa = new Map();
  for (const r of registros) {
    const k = chave(r);
    const item = mapa.get(k) ?? {postos: 0};
    item[r.produto] = r.preco;
    item.postos = Math.max(item.postos, r.postos);
    mapa.set(k, item);
  }
  return mapa;
}

const completo = (item) => item && item.gasolina && item.etanol;

function montarDados(abas, fonteUrl) {
  const estados = lerAba(abas.ESTADOS, COLUNAS.ESTADOS);
  const municipios = lerAba(abas.MUNICIPIOS, COLUNAS.MUNICIPIOS);
  const brasil = lerAba(abas.BRASIL, COLUNAS.BRASIL);
  if (!estados.length || !municipios.length || !brasil.length) {
    throw new Error('Planilha da ANP sem dados de preços');
  }
  const porEstado = agrupar(estados, (r) => r.local);
  const porCidade = agrupar(municipios, (r) => `${r.local}|${r.cidade}`);
  const nacional = [...agrupar(brasil, (r) => r.local).values()][0];

  const lista = Object.entries(ESTADOS)
    .map(([nomeAnp, [uf, nome]]) => {
      const media = porEstado.get(nomeAnp);
      const cidades = [...porCidade.entries()]
        .filter(([k, v]) => k.startsWith(`${nomeAnp}|`) && completo(v))
        .map(([k, v]) => ({
          nome: k.slice(nomeAnp.length + 1),
          gasolina: v.gasolina,
          etanol: v.etanol,
          postos: v.postos,
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      return completo(media)
        ? {
            uf,
            nome,
            gasolina: media.gasolina,
            etanol: media.etanol,
            municipios: cidades,
          }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  if (!completo(nacional) || lista.length < ESTADOS.length / 2) {
    throw new Error('Dados da ANP incompletos');
  }
  return {
    fonte:
      'ANP - Levantamento de Preços de Combustíveis (preço médio de revenda)',
    fonteUrl,
    semana: {
      inicio: serialParaIso(brasil[0].inicio),
      fim: serialParaIso(brasil[0].fim),
    },
    brasil: {gasolina: nacional.gasolina, etanol: nacional.etanol},
    estados: lista,
  };
}

// Na planilha de postos o etanol se chama apenas ETANOL.
const PRODUTOS_POSTO = {'GASOLINA COMUM': 'gasolina', ETANOL: 'etanol'};

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
    const produto = PRODUTOS_POSTO[l[COL_POSTO.produto]];
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

module.exports = {montarDados, montarPostos, serialParaIso, ESTADOS};
