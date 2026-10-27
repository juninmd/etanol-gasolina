// Converte o resumo semanal da ANP (abas ESTADOS, MUNICIPIOS e BRASIL) em JSON.
const {completo, listarCidades} = require('./cidades');
const ESTADOS = {
  ACRE: ['AC', 'Acre', 'NORTE'],
  ALAGOAS: ['AL', 'Alagoas', 'NORDESTE'],
  AMAPA: ['AP', 'Amapá', 'NORTE'],
  AMAZONAS: ['AM', 'Amazonas', 'NORTE'],
  BAHIA: ['BA', 'Bahia', 'NORDESTE'],
  CEARA: ['CE', 'Ceará', 'NORDESTE'],
  'DISTRITO FEDERAL': ['DF', 'Distrito Federal', 'CENTRO OESTE'],
  'ESPIRITO SANTO': ['ES', 'Espírito Santo', 'SUDESTE'],
  GOIAS: ['GO', 'Goiás', 'CENTRO OESTE'],
  MARANHAO: ['MA', 'Maranhão', 'NORDESTE'],
  'MATO GROSSO': ['MT', 'Mato Grosso', 'CENTRO OESTE'],
  'MATO GROSSO DO SUL': ['MS', 'Mato Grosso do Sul', 'CENTRO OESTE'],
  'MINAS GERAIS': ['MG', 'Minas Gerais', 'SUDESTE'],
  PARA: ['PA', 'Pará', 'NORTE'],
  PARAIBA: ['PB', 'Paraíba', 'NORDESTE'],
  PARANA: ['PR', 'Paraná', 'SUL'],
  PERNAMBUCO: ['PE', 'Pernambuco', 'NORDESTE'],
  PIAUI: ['PI', 'Piauí', 'NORDESTE'],
  'RIO DE JANEIRO': ['RJ', 'Rio de Janeiro', 'SUDESTE'],
  'RIO GRANDE DO NORTE': ['RN', 'Rio Grande do Norte', 'NORDESTE'],
  'RIO GRANDE DO SUL': ['RS', 'Rio Grande do Sul', 'SUL'],
  RONDONIA: ['RO', 'Rondônia', 'NORTE'],
  RORAIMA: ['RR', 'Roraima', 'NORTE'],
  'SANTA CATARINA': ['SC', 'Santa Catarina', 'SUL'],
  'SAO PAULO': ['SP', 'São Paulo', 'SUDESTE'],
  SERGIPE: ['SE', 'Sergipe', 'NORDESTE'],
  TOCANTINS: ['TO', 'Tocantins', 'NORTE'],
};

const ESTADOS_TOTAL = Object.keys(ESTADOS).length;

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
  REGIOES: {local: 2, cidade: null, produto: 3},
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

/**
 * @param abas planilha do resumo semanal da ANP
 * @param fonteUrl endereço da planilha
 * @param municipios {UF: [nomes]} do IBGE; sem ele só entram cidades da ANP
 */
function montarDados(abas, fonteUrl, municipios = {}) {
  const estados = lerAba(abas.ESTADOS, COLUNAS.ESTADOS);
  const cidades = lerAba(abas.MUNICIPIOS, COLUNAS.MUNICIPIOS);
  const regioes = lerAba(abas.REGIOES, COLUNAS.REGIOES);
  const brasil = lerAba(abas.BRASIL, COLUNAS.BRASIL);
  if (!estados.length || !cidades.length || !brasil.length) {
    throw new Error('Planilha da ANP sem dados de preços');
  }
  const porEstado = agrupar(estados, (r) => r.local);
  const porRegiao = agrupar(regioes, (r) => r.local);
  const porCidade = agrupar(cidades, (r) => `${r.local}|${r.cidade}`);
  const nacional = [...agrupar(brasil, (r) => r.local).values()][0];

  const lista = Object.entries(ESTADOS)
    .map(([nomeAnp, [uf, nome, regiao]]) => {
      // Sem pesquisa de um dos combustíveis no estado, usa a média da região.
      const proprio = completo(porEstado.get(nomeAnp));
      const media = proprio ? porEstado.get(nomeAnp) : porRegiao.get(regiao);
      return completo(media)
        ? {
            uf,
            nome,
            regiao,
            base: proprio ? 'estado' : 'regiao',
            gasolina: media.gasolina,
            etanol: media.etanol,
            municipios: listarCidades(nomeAnp, municipios[uf], porCidade),
          }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  if (!completo(nacional) || lista.length < ESTADOS_TOTAL / 2) {
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

module.exports = {montarDados, serialParaIso, ESTADOS};
