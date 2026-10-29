import {ListaPostos, validarPostos} from '../lib/postos';

const BASE =
  'https://raw.githubusercontent.com/juninmd/etanol-gasolina/master/data/postos';

const cache = new Map<string, ListaPostos>();

/** Postos da UF com preços da ANP; null se estiver indisponível. */
export async function carregarPostos(
  uf: string,
  buscar: typeof fetch = fetch,
  tempoLimiteMs = 10000,
): Promise<ListaPostos | null> {
  const guardado = cache.get(uf);
  if (guardado) {
    return guardado;
  }
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), tempoLimiteMs);
  try {
    const resposta = await buscar(`${BASE}/${uf}.json`, {
      signal: controle.signal,
    });
    const lista = resposta.ok ? validarPostos(await resposta.json()) : null;
    if (lista) {
      cache.set(uf, lista);
    }
    return lista;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export const limparCachePostos = () => cache.clear();
