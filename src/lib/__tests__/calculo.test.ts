import {compararCombustiveis, lerNumero, melhorPelaRegra} from '../calculo';

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

  it('trata empate exato de 70% apesar do erro de ponto flutuante', () => {
    const r = compararCombustiveis({precoGasolina: 7, precoEtanol: 4.9});
    expect(r?.melhor).toBe('etanol');
    expect(r?.economiaPct).toBeCloseTo(0, 6);
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
    // O app precisa avisar que o consumo digitado não entrou na conta.
    expect(r?.consumoIncompleto).toBe(true);
  });

  it('não acusa consumo incompleto quando nenhum ou os dois foram informados', () => {
    const base = {precoGasolina: 6.5, precoEtanol: 4.2};
    expect(compararCombustiveis(base)?.consumoIncompleto).toBe(false);
    expect(
      compararCombustiveis({...base, consumoGasolina: 12, consumoEtanol: 9})
        ?.consumoIncompleto,
    ).toBe(false);
  });

  it('devolve null para preços ausentes ou inválidos', () => {
    expect(
      compararCombustiveis({precoGasolina: NaN, precoEtanol: 4}),
    ).toBeNull();
    expect(compararCombustiveis({precoGasolina: 6, precoEtanol: 0})).toBeNull();
  });
});

describe('melhorPelaRegra', () => {
  it('concorda com o cartão do resultado em empates exatos de 70%', () => {
    // 2,10 / 3,00 = 70%: a lista de postos e o cartão precisam dar a mesma resposta.
    for (const [gasolina, etanol] of [
      [3.0, 2.1],
      [3.2, 2.24],
      [3.5, 2.45],
    ]) {
      expect(melhorPelaRegra(gasolina, etanol)).toBe(
        compararCombustiveis({precoGasolina: gasolina, precoEtanol: etanol})
          ?.melhor,
      );
    }
  });

  it('escolhe gasolina quando o etanol passa de 70%', () => {
    expect(melhorPelaRegra(5.0, 3.6)).toBe('gasolina');
    expect(melhorPelaRegra(5.0, 3.4)).toBe('etanol');
  });
});
