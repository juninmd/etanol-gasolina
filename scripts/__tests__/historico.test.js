const {abrirHistorico, registrarSemana} = require('../historico');

const semana = (inicio, fim, g, e) => ({
  semana: {inicio, fim},
  brasil: {gasolina: g, etanol: e},
  estados: [
    {
      uf: 'SP',
      nome: 'São Paulo',
      base: 'estado',
      gasolina: g - 0.1,
      etanol: e - 0.1,
      municipios: [
        {nome: 'Campinas', gasolina: g - 0.2, etanol: e - 0.2, postos: 8},
        {nome: 'Adolfo', ref: 'Campinas', km: 20},
      ],
    },
    {
      uf: 'AP',
      nome: 'Amapá',
      base: 'regiao',
      gasolina: g,
      etanol: e,
      municipios: [{nome: 'Macapá'}],
    },
  ],
});

describe('histórico em SQLite', () => {
  let db;
  beforeEach(() => {
    db = abrirHistorico(':memory:');
  });

  it('grava só preço medido: Brasil, estado pesquisado e cidades da ANP', () => {
    expect(
      registrarSemana(db, semana('2026-10-11', '2026-10-17', 6.5, 4.1)),
    ).toBe(true);
    const locais = db
      .prepare('SELECT uf, cidade FROM precos ORDER BY uf, cidade')
      .all()
      .map((l) => `${l.uf}|${l.cidade}`);
    expect(locais).toEqual(['|', 'SP|', 'SP|Campinas']);
  });

  it('ignora semana já registrada', () => {
    const s = semana('2026-10-11', '2026-10-17', 6.5, 4.1);
    expect(registrarSemana(db, s)).toBe(true);
    expect(registrarSemana(db, s)).toBe(false);
    expect(db.prepare('SELECT COUNT(*) n FROM semanas').get().n).toBe(1);
  });

  it('calcula a variação para a semana anterior', () => {
    registrarSemana(db, semana('2026-10-11', '2026-10-17', 6.5, 4.0));
    registrarSemana(db, semana('2026-10-18', '2026-10-24', 6.6, 3.9));
    const v = db
      .prepare(
        "SELECT * FROM variacao WHERE uf = 'SP' AND cidade = 'Campinas' ORDER BY inicio",
      )
      .all();
    expect(v[0].var_gasolina).toBeNull();
    expect(v[1]).toMatchObject({
      inicio: '2026-10-18',
      var_gasolina: 0.1,
      var_etanol: -0.1,
      var_gasolina_pct: 1.59,
      var_etanol_pct: -2.63,
    });
  });
});
