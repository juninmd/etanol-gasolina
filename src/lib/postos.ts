import {custoEfetivo} from './calculo';
import {normalizar} from './precos';

export type Posto = {
  nome: string;
  bandeira: string;
  endereco: string;
  municipio: string;
  gasolina: number;
  etanol: number;
  /** Data da coleta da ANP, AAAA-MM-DD. */
  coleta: string;
};

export type ListaPostos = {
  semana: {inicio: string; fim: string};
  postos: Posto[];
};

const preco = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n > 0 && n < 50;

const texto = (v: unknown): v is string => typeof v === 'string';

const postoValido = (p: any): p is Posto =>
  typeof p === 'object' &&
  p !== null &&
  texto(p.nome) &&
  texto(p.bandeira) &&
  texto(p.endereco) &&
  texto(p.municipio) &&
  texto(p.coleta) &&
  preco(p.gasolina) &&
  preco(p.etanol);

/** Aceita só JSON no formato esperado; qualquer outra coisa vira null. */
export function validarPostos(dados: any): ListaPostos | null {
  const ok =
    typeof dados === 'object' &&
    dados !== null &&
    texto(dados.semana?.inicio) &&
    texto(dados.semana?.fim) &&
    Array.isArray(dados.postos) &&
    dados.postos.every(postoValido);
  return ok ? (dados as ListaPostos) : null;
}

/** Postos do município, do mais barato para o mais caro. */
export function postosDaCidade(
  lista: ListaPostos | null,
  municipio: string | null,
  limite = 10,
): Posto[] {
  if (!lista || !municipio) {
    return [];
  }
  const alvo = normalizar(municipio);
  return lista.postos
    .filter((p) => normalizar(p.municipio) === alvo)
    .sort(
      (a, b) =>
        custoEfetivo(a.gasolina, a.etanol) - custoEfetivo(b.gasolina, b.etanol),
    )
    .slice(0, limite);
}
