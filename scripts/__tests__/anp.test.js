const {montarDados, serialParaIso} = require('../anp');
const {montarPostos} = require('../postos');

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
  REGIOES: [
    CAB,
    linha('NORTE', 'GASOLINA COMUM', 100, 'R$/l', 6.9),
    linha('NORTE', 'ETANOL HIDRATADO', 100, 'R$/l', 4.9),
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
    expect(sp.municipios.map((m) => m.nome)).toEqual(['Campinas']);
    expect(sp.municipios[0]).toMatchObject({gasolina: 6.4, etanol: 3.9});
  });

  it('lista as cidades do IBGE e cai para a região quando o estado não tem pesquisa', () => {
    const semAcre = {
      ...abas,
      ESTADOS: abas.ESTADOS.filter((l) => l[3] !== 'ACRE'),
    };
    const completa = montarDados(semAcre, 'x', {
      SP: ['Campinas', 'Adamantina'],
      AC: ['Rio Branco', 'Acrelândia'],
    });
    const ac = completa.estados.find((e) => e.uf === 'AC');
    expect(ac).toMatchObject({
      base: 'regiao',
      regiao: 'NORTE',
      gasolina: 6.9,
      etanol: 4.9,
    });
    expect(ac.municipios.map((m) => m.nome)).toEqual([
      'Acrelândia',
      'Rio Branco',
    ]);
    expect(ac.municipios[1].gasolina).toBe(7.5);
    const sp = completa.estados.find((e) => e.uf === 'SP');
    expect(sp.base).toBe('estado');
    expect(sp.municipios).toEqual([
      {nome: 'Adamantina'},
      {nome: 'Campinas', gasolina: 6.4, etanol: 3.9, postos: 8},
    ]);
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

describe('montarPostos', () => {
  const cabecalho = [
    'CNPJ',
    'RAZÃO',
    'FANTASIA',
    'ENDEREÇO',
    'NÚMERO',
    'COMPLEMENTO',
    'BAIRRO',
    'CEP',
    'MUNICÍPIO',
    'ESTADO',
    'BANDEIRA',
    'PRODUTO',
    'UNIDADE DE MEDIDA',
    'PREÇO DE REVENDA',
    'DATA DA COLETA',
  ];
  const linhaPosto = (cnpj, fantasia, cidadeNome, uf, produto, preco) => [
    cnpj,
    `${fantasia} LTDA`,
    fantasia,
    'RUA A',
    10,
    null,
    'CENTRO',
    1000,
    cidadeNome,
    uf,
    'BRANCA',
    produto,
    'R$ / litro',
    preco,
    46307,
  ];
  const planilha = [
    ['SISTEMA DE LEVANTAMENTO DE PREÇOS'],
    ['PERÍODO: 11/10/2026 A 17/10/2026'],
    cabecalho,
    linhaPosto(1, 'POSTO B', 'CAMPINAS', 'SAO PAULO', 'GASOLINA COMUM', 6.4),
    linhaPosto(1, 'POSTO B', 'CAMPINAS', 'SAO PAULO', 'ETANOL', 3.9),
    linhaPosto(1, 'POSTO B', 'CAMPINAS', 'SAO PAULO', 'DIESEL S10', 6),
    linhaPosto(2, 'POSTO A', 'CAMPINAS', 'SAO PAULO', 'GASOLINA COMUM', 6.5),
    linhaPosto(2, 'POSTO A', 'CAMPINAS', 'SAO PAULO', 'ETANOL', 4.1),
    linhaPosto(3, 'SÓ GASOLINA', 'RIO BRANCO', 'ACRE', 'GASOLINA COMUM', 7.5),
  ];

  it('lê o período e agrupa por UF só postos com os dois combustíveis', () => {
    const {semana, porUf} = montarPostos(planilha);
    expect(semana).toEqual({inicio: '2026-10-11', fim: '2026-10-17'});
    expect(Object.keys(porUf)).toEqual(['SP']);
    expect(porUf.SP.map((p) => p.nome)).toEqual(['POSTO A', 'POSTO B']);
    expect(porUf.SP[1]).toEqual({
      nome: 'POSTO B',
      bandeira: 'BRANCA',
      endereco: 'RUA A, 10 - CENTRO',
      municipio: 'CAMPINAS',
      gasolina: 6.4,
      etanol: 3.9,
      coleta: '2026-10-12',
    });
  });

  it('falha sem cabeçalho ou sem período', () => {
    expect(() => montarPostos([['x']])).toThrow('Cabeçalho');
    expect(() => montarPostos([cabecalho])).toThrow('Período');
  });
});
