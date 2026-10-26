import dados from '../../../data/precos.json';
import {
  formatarReais,
  formatarSemana,
  nomeLegivel,
  precoParaTexto,
  validarPrecos,
} from '../precos';

describe('validarPrecos', () => {
  it('aceita o arquivo de preços do repositório', () => {
    const precos = validarPrecos(dados);
    // Estados sem gasolina e etanol na semana (ex.: AP) ficam de fora.
    expect(precos?.estados.length).toBeGreaterThanOrEqual(25);
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
