export type Municipio = {
  nome: string;
  gasolina: number;
  etanol: number;
  postos: number;
};

export type Estado = {
  uf: string;
  nome: string;
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
            preco(m.gasolina) &&
            preco(m.etanol),
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

/** "SAO JOSE DO RIO PRETO" -> "Sao Jose do Rio Preto". */
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
