export type Combustivel = 'etanol' | 'gasolina';

export type Entrada = {
  precoGasolina: number;
  precoEtanol: number;
  consumoGasolina?: number;
  consumoEtanol?: number;
};

export type Resultado = {
  melhor: Combustivel;
  /** Preço do etanol dividido pelo da gasolina. */
  razao: number;
  /** 'consumo' usa o custo por km; 'regra70' usa a regra prática dos 70%. */
  criterio: 'consumo' | 'regra70';
  /** Quanto o melhor combustível economiza por km rodado, em %. */
  economiaPct: number;
  custoKmGasolina?: number;
  custoKmEtanol?: number;
};

/** Etanol rende em média 70% do que a gasolina rende. */
export const LIMITE_ETANOL = 0.7;

/** Converte "5,89" ou "5.89" em número; devolve NaN se não for válido. */
export function lerNumero(texto: string): number {
  const limpo = texto.trim();
  if (!limpo) {
    return NaN;
  }
  return Number(
    limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo,
  );
}

const valido = (n?: number): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n > 0;

export function compararCombustiveis(entrada: Entrada): Resultado | null {
  const {precoGasolina, precoEtanol, consumoGasolina, consumoEtanol} = entrada;
  if (!valido(precoGasolina) || !valido(precoEtanol)) {
    return null;
  }
  const razao = precoEtanol / precoGasolina;
  const usaConsumo = valido(consumoGasolina) && valido(consumoEtanol);
  const custoKmGasolina = usaConsumo
    ? precoGasolina / consumoGasolina
    : undefined;
  const custoKmEtanol = usaConsumo ? precoEtanol / consumoEtanol : undefined;

  // Sem o consumo real, assume que o etanol rende 70% da gasolina.
  const custoGasolina = custoKmGasolina ?? precoGasolina;
  const custoEtanol = custoKmEtanol ?? precoEtanol / LIMITE_ETANOL;
  const melhor: Combustivel =
    custoEtanol <= custoGasolina ? 'etanol' : 'gasolina';
  const [barato, caro] =
    melhor === 'etanol'
      ? [custoEtanol, custoGasolina]
      : [custoGasolina, custoEtanol];

  return {
    melhor,
    razao,
    criterio: usaConsumo ? 'consumo' : 'regra70',
    economiaPct: (1 - barato / caro) * 100,
    custoKmGasolina,
    custoKmEtanol,
  };
}
