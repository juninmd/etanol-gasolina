import dados from '../../../data/precos.json';
import {
  avisoDeOrigem,
  formatarReais,
  normalizar,
  formatarSemana,
  nomeLegivel,
  precoParaTexto,
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

describe('avisoDeOrigem', () => {
  const estado = {
    uf: 'SP',
    nome: 'São Paulo',
    gasolina: 6.3,
    etanol: 3.9,
    municipios: [],
  };

  it('não avisa para cidade pesquisada ou estado com pesquisa', () => {
    expect(
      avisoDeOrigem(estado, {nome: 'Campinas', gasolina: 6, etanol: 4}),
    ).toBeNull();
    expect(avisoDeOrigem(estado, undefined)).toBeNull();
    expect(avisoDeOrigem(undefined, undefined)).toBeNull();
  });

  it('avisa quando a cidade não foi pesquisada', () => {
    expect(avisoDeOrigem(estado, {nome: 'Adolfo'})).toBe(
      'A ANP não pesquisou Adolfo: usando a média de São Paulo.',
    );
  });

  it('avisa quando o estado usa a média da região', () => {
    const ap = {
      ...estado,
      nome: 'Amapá',
      regiao: 'NORTE',
      base: 'regiao' as const,
    };
    expect(avisoDeOrigem(ap, undefined)).toBe(
      'A ANP não pesquisou Amapá nesta semana: usando a média da região Norte.',
    );
    expect(avisoDeOrigem(ap, {nome: 'Macapá'})).toContain('região Norte');
  });
});
