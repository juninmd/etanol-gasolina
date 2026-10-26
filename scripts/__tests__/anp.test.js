const {montarDados, serialParaIso} = require('../anp');

const CAB = ['DATA INICIAL', 'DATA FINAL'];
const linha = (...resto) => [46306, 46312, ...resto];
// ESTADOS: REGIAO, ESTADO, PRODUTO, POSTOS, UNIDADE, PRECO
const estado = (uf, produto, preco) =>
  linha('SUDESTE', uf, produto, 10, 'R$/l', preco);
// MUNICIPIOS: ESTADO, MUNICIPIO, PRODUTO, POSTOS, UNIDADE, PRECO
const cidade = (uf, nome, produto, preco) =>
  linha(uf, nome, produto, 8, 'R$/l', preco);

const ufs = [
  'ACRE',
  'ALAGOAS',
  'AMAPA',
  'AMAZONAS',
  'BAHIA',
  'CEARA',
  'DISTRITO FEDERAL',
  'ESPIRITO SANTO',
  'GOIAS',
  'MARANHAO',
  'MATO GROSSO',
  'MATO GROSSO DO SUL',
  'MINAS GERAIS',
  'PARA',
  'PARAIBA',
  'PARANA',
  'PERNAMBUCO',
  'PIAUI',
  'RIO DE JANEIRO',
  'RIO GRANDE DO NORTE',
  'RIO GRANDE DO SUL',
  'RONDONIA',
  'RORAIMA',
  'SANTA CATARINA',
  'SAO PAULO',
  'SERGIPE',
  'TOCANTINS',
];

const abas = {
  ESTADOS: [
    CAB,
    ...ufs.flatMap((uf) => [
      estado(uf, 'GASOLINA COMUM', 6.5),
      estado(uf, 'ETANOL HIDRATADO', 4.2),
      estado(uf, 'GLP', 110),
    ]),
  ],
  MUNICIPIOS: [
    CAB,
    cidade('SAO PAULO', 'CAMPINAS', 'GASOLINA COMUM', 6.4),
    cidade('SAO PAULO', 'CAMPINAS', 'ETANOL HIDRATADO', 3.9),
    cidade('SAO PAULO', 'SO GASOLINA', 'GASOLINA COMUM', 6.4),
    cidade('ACRE', 'RIO BRANCO', 'GASOLINA COMUM', 7.5),
    cidade('ACRE', 'RIO BRANCO', 'ETANOL HIDRATADO', 5.1),
  ],
  BRASIL: [
    CAB,
    linha('BRASIL', 'GASOLINA COMUM', 4500, 'R$/l', 6.53),
    linha('BRASIL', 'ETANOL HIDRATADO', 3800, 'R$/l', 4.11),
  ],
};

describe('montarDados', () => {
  const dados = montarDados(abas, 'http://anp');

  it('lê a semana e a média nacional', () => {
    expect(dados.semana).toEqual({inicio: '2026-10-11', fim: '2026-10-17'});
    expect(dados.brasil).toEqual({gasolina: 6.53, etanol: 4.11});
  });

  it('monta estados com sigla e nome acentuado, em ordem alfabética', () => {
    expect(dados.estados).toHaveLength(27);
    const sp = dados.estados.find((e) => e.uf === 'SP');
    expect(sp.nome).toBe('São Paulo');
    expect(sp.gasolina).toBe(6.5);
    expect(dados.estados[0].nome).toBe('Acre');
  });

  it('inclui só municípios com gasolina e etanol', () => {
    const sp = dados.estados.find((e) => e.uf === 'SP');
    expect(sp.municipios.map((m) => m.nome)).toEqual(['CAMPINAS']);
    expect(sp.municipios[0]).toMatchObject({gasolina: 6.4, etanol: 3.9});
  });

  it('falha com planilha sem cabeçalho ou sem preços', () => {
    expect(() =>
      montarDados({ESTADOS: [], MUNICIPIOS: [], BRASIL: []}),
    ).toThrow();
    expect(() => montarDados({...abas, BRASIL: [CAB]}, 'http://anp')).toThrow(
      'sem dados',
    );
  });
});

describe('serialParaIso', () => {
  it('converte datas seriais do Excel', () => {
    expect(serialParaIso(46306)).toBe('2026-10-11');
  });
});
