import dados from '../../../data/precos.json';
import {
  formatarReais,
  normalizar,
  formatarSemana,
  nomeLegivel,
  precoParaTexto,
  resolverPreco,
  validarPrecos,
} from '../precos';

describe('validarPrecos', () => {
  it('aceita o arquivo de preços do repositório', () => {
    const precos = validarPrecos(dados);
    expect(precos?.estados.length).toBe(27);
    expect(precos?.brasil.gasolina).toBeGreaterThan(0);
  });

  it('rejeita formatos inesperados', () => {
    expect(validarPrecos(null)).toBeNull();
    expect(validarPrecos({})).toBeNull();
    expect(validarPrecos({...dados, estados: []})).toBeNull();
    expect(
      validarPrecos({...dados, brasil: {gasolina: 'x', etanol: 4}}),
    ).toBeNull();
  });
});

describe('formatação', () => {
  it('formata preços em reais', () => {
    expect(precoParaTexto(6.5)).toBe('6,50');
    expect(formatarReais(4.119)).toBe('R$ 4,12');
  });

  it('formata a semana como dd/mm a dd/mm/aaaa', () => {
    expect(formatarSemana({inicio: '2026-10-11', fim: '2026-10-17'})).toBe(
      '11/10 a 17/10/2026',
    );
  });

  it('deixa nomes de cidades legíveis', () => {
    expect(nomeLegivel('SAO JOSE DO RIO PRETO')).toBe('Sao Jose do Rio Preto');
  });
});

describe('normalizar', () => {
  it('compara nomes do IBGE e da ANP', () => {
    expect(normalizar("Santa Bárbara d'Oeste")).toBe('SANTA BARBARA D OESTE');
    expect(normalizar('SÃO JOÃO DEL-REI')).toBe(normalizar('Sao Joao del Rei'));
  });
});

describe('resolverPreco', () => {
  const estado = {
    uf: 'SP',
    nome: 'São Paulo',
    gasolina: 6.3,
    etanol: 3.9,
    municipios: [
      {nome: 'Campinas', gasolina: 6.4, etanol: 3.8, postos: 8},
      {nome: 'Adolfo', ref: 'Campinas', km: 35},
      {nome: 'Longe'},
    ],
  };

  it('usa o preço da própria cidade, sem aviso', () => {
    expect(resolverPreco(estado, estado.municipios[0])).toEqual({
      gasolina: 6.4,
      etanol: 3.8,
      aviso: null,
    });
  });

  it('usa a cidade pesquisada mais próxima como estimativa', () => {
    expect(resolverPreco(estado, estado.municipios[1])).toEqual({
      gasolina: 6.4,
      etanol: 3.8,
      aviso:
        'Estimativa: a ANP não pesquisou Adolfo; usando os preços de Campinas, a 35 km.',
    });
  });

  it('cai para a média do estado quando não há referência', () => {
    expect(resolverPreco(estado, estado.municipios[2])).toEqual({
      gasolina: 6.3,
      etanol: 3.9,
      aviso: 'A ANP não pesquisou Longe: usando a média de São Paulo.',
    });
    expect(resolverPreco(estado)).toMatchObject({gasolina: 6.3, aviso: null});
  });

  it('usa a média da região quando o estado não tem pesquisa', () => {
    const ap = {
      ...estado,
      nome: 'Amapá',
      regiao: 'NORTE',
      base: 'regiao' as const,
      municipios: [{nome: 'Macapá'}],
    };
    expect(resolverPreco(ap).aviso).toBe(
      'A ANP não pesquisou Amapá nesta semana: usando a média da região Norte.',
    );
    expect(resolverPreco(ap, ap.municipios[0]).aviso).toContain('região Norte');
  });
});
