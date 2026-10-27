const {listarCidades, normalizar} = require('../cidades');

describe('normalizar', () => {
  it('iguala a grafia do IBGE à da ANP', () => {
    expect(normalizar('São João del-Rei')).toBe('SAO JOAO DEL REI');
    expect(normalizar("Santa Bárbara d'Oeste")).toBe('SANTA BARBARA D OESTE');
  });
});

describe('listarCidades', () => {
  const pesquisadas = new Map([
    ['SAO PAULO|CAMPINAS', {gasolina: 6.4, etanol: 3.9, postos: 8}],
    ['SAO PAULO|SO GASOLINA', {gasolina: 6.4, postos: 3}],
    ['SAO PAULO|CIDADE NOVA', {gasolina: 6.1, etanol: 3.8, postos: 5}],
    ['ACRE|RIO BRANCO', {gasolina: 7.5, etanol: 5.1, postos: 9}],
  ]);

  it('lista todas as cidades do IBGE e põe preço só nas pesquisadas', () => {
    const lista = listarCidades(
      'SAO PAULO',
      ['Campinas', 'Adamantina', 'Só Gasolina'],
      pesquisadas,
    );
    expect(lista.map((c) => c.nome)).toEqual([
      'Adamantina',
      'Campinas',
      'Cidade Nova',
      'Só Gasolina',
    ]);
    expect(lista[0]).toEqual({nome: 'Adamantina'});
    expect(lista[1]).toEqual({
      nome: 'Campinas',
      gasolina: 6.4,
      etanol: 3.9,
      postos: 8,
    });
    // Cidade da ANP fora da lista do IBGE entra com nome legível.
    expect(lista[2].gasolina).toBe(6.1);
    // Sem etanol na ANP, a cidade fica sem preço.
    expect(lista[3]).toEqual({nome: 'Só Gasolina'});
  });

  it('sem lista do IBGE usa apenas as cidades da ANP', () => {
    const lista = listarCidades('ACRE', undefined, pesquisadas);
    expect(lista).toEqual([
      {nome: 'Rio Branco', gasolina: 7.5, etanol: 5.1, postos: 9},
    ]);
  });
});
