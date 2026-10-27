/** Sem gasolina/etanol a ANP não pesquisou a cidade: vale `ref` ou a média do estado. */
export type Municipio = {
  nome: string;
  gasolina?: number;
  etanol?: number;
  postos?: number;
  /** Cidade pesquisada mais próxima (mesmo estado) e distância em km. */
  ref?: string;
  km?: number;
};

export type Estado = {
  uf: string;
  nome: string;
  regiao?: string;
  /** 'regiao': o estado não tem pesquisa completa e usa a média da região. */
  base?: 'estado' | 'regiao';
  gasolina: number;
  etanol: number;
  municipios: Municipio[];
};

export type Precos = {
  fonte: string;
  fonteUrl: string;
  semana: {inicio: string; fim: string};
  brasil: {gasolina: number; etanol: number};
  estados: Estado[];
};

const preco = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n > 0 && n < 50;

const objeto = (v: unknown): v is Record<string, any> =>
  typeof v === 'object' && v !== null;

/** Aceita só JSON no formato esperado; qualquer outra coisa vira null. */
export function validarPrecos(dados: unknown): Precos | null {
  if (!objeto(dados) || !objeto(dados.semana) || !objeto(dados.brasil)) {
    return null;
  }
  const {semana, brasil, estados} = dados;
  const ok =
    typeof semana.inicio === 'string' &&
    typeof semana.fim === 'string' &&
    preco(brasil.gasolina) &&
    preco(brasil.etanol) &&
    Array.isArray(estados) &&
    estados.length > 0 &&
    estados.every(
      (e) =>
        objeto(e) &&
        typeof e.uf === 'string' &&
        typeof e.nome === 'string' &&
        preco(e.gasolina) &&
        preco(e.etanol) &&
        Array.isArray(e.municipios) &&
        e.municipios.every(
          (m: unknown) =>
            objeto(m) &&
            typeof m.nome === 'string' &&
            (m.gasolina === undefined ||
              (preco(m.gasolina) && preco(m.etanol))),
        ),
    );
  return ok ? (dados as Precos) : null;
}

const formatarData = (iso: string) => iso.split('-').reverse().join('/');

export const formatarSemana = ({inicio, fim}: Precos['semana']) =>
  `${formatarData(inicio).slice(0, 5)} a ${formatarData(fim)}`;

/** Preço em texto pt-BR para preencher o campo, ex.: 6.53 -> "6,53". */
export const precoParaTexto = (valor: number) =>
  valor.toFixed(2).replace('.', ',');

export const formatarReais = (valor: number) => `R$ ${precoParaTexto(valor)}`;

/** Compara nomes sem acento, caixa ou hífen: "São João del-Rei" = "SAO JOAO DEL REI". */
export const normalizar = (nome: string) =>
  nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

/** "AUTO POSTO DO ZE" -> "Auto Posto do Ze". */
export function nomeLegivel(nome: string): string {
  const minusculas = new Set(['de', 'do', 'da', 'dos', 'das', 'e']);
  return nome
    .toLowerCase()
    .split(' ')
    .map((p, i) =>
      i > 0 && minusculas.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1),
    )
    .join(' ');
}

export const temPreco = (
  m: Municipio,
): m is Required<Pick<Municipio, 'gasolina' | 'etanol'>> & Municipio =>
  m.gasolina !== undefined && m.etanol !== undefined;

export type PrecoResolvido = {
  gasolina: number;
  etanol: number;
  /** Explica quando os preços não são da cidade escolhida. */
  aviso: string | null;
};

/**
 * Preço a usar para a cidade: o da ANP; senão o da cidade pesquisada mais
 * próxima (estimativa); senão a média do estado ou da região.
 */
export function resolverPreco(
  estado: Estado,
  municipio?: Municipio,
): PrecoResolvido {
  const regiao = estado.base === 'regiao';
  const media = regiao
    ? `a média da região ${nomeLegivel(estado.regiao ?? '')}`
    : `a média de ${estado.nome}`;
  if (!municipio) {
    return {
      gasolina: estado.gasolina,
      etanol: estado.etanol,
      aviso: regiao
        ? `A ANP não pesquisou ${estado.nome} nesta semana: usando ${media}.`
        : null,
    };
  }
  if (temPreco(municipio)) {
    return {
      gasolina: municipio.gasolina,
      etanol: municipio.etanol,
      aviso: null,
    };
  }
  const ref = estado.municipios.find((m) => m.nome === municipio.ref);
  if (ref && temPreco(ref)) {
    return {
      gasolina: ref.gasolina,
      etanol: ref.etanol,
      aviso: `Estimativa: a ANP não pesquisou ${municipio.nome}; usando os preços de ${ref.nome}, a ${municipio.km} km.`,
    };
  }
  return {
    gasolina: estado.gasolina,
    etanol: estado.etanol,
    aviso: `A ANP não pesquisou ${municipio.nome}: usando ${media}.`,
  };
}
