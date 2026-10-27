import {compararCombustiveis, lerNumero} from '../calculo';

describe('lerNumero', () => {
  it('aceita vírgula e ponto decimais', () => {
    expect(lerNumero('5,89')).toBe(5.89);
    expect(lerNumero('5.89')).toBe(5.89);
    expect(lerNumero('1.234,50')).toBe(1234.5);
  });

  it('devolve NaN para texto vazio ou inválido', () => {
    expect(lerNumero('')).toBeNaN();
    expect(lerNumero('abc')).toBeNaN();
  });
});

describe('compararCombustiveis', () => {
  it('escolhe etanol quando custa até 70% da gasolina', () => {
    const r = compararCombustiveis({precoGasolina: 6.5, precoEtanol: 4.2});
    expect(r?.melhor).toBe('etanol');
    expect(r?.criterio).toBe('regra70');
    expect(r?.razao).toBeCloseTo(0.646, 3);
  });

  it('escolhe gasolina quando o etanol passa de 70%', () => {
    const r = compararCombustiveis({precoGasolina: 6.5, precoEtanol: 4.9});
    expect(r?.melhor).toBe('gasolina');
    expect(r?.economiaPct).toBeGreaterThan(0);
  });

  it('usa o custo por km quando os dois consumos são informados', () => {
    const r = compararCombustiveis({
      precoGasolina: 6.5,
      precoEtanol: 4.9,
      consumoGasolina: 12,
      consumoEtanol: 9,
    });
    expect(r?.criterio).toBe('consumo');
    expect(r?.custoKmGasolina).toBeCloseTo(0.5417, 4);
    expect(r?.custoKmEtanol).toBeCloseTo(0.5444, 4);
    expect(r?.melhor).toBe('gasolina');
  });

  it('ignora consumo se só um dos valores foi informado', () => {
    const r = compararCombustiveis({
      precoGasolina: 6.5,
      precoEtanol: 4.2,
      consumoGasolina: 12,
    });
    expect(r?.criterio).toBe('regra70');
  });

  it('devolve null para preços ausentes ou inválidos', () => {
    expect(
      compararCombustiveis({precoGasolina: NaN, precoEtanol: 4}),
    ).toBeNull();
    expect(compararCombustiveis({precoGasolina: 6, precoEtanol: 0})).toBeNull();
  });
});
