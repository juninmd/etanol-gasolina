import embutido from '../../data/precos.json';
import {Precos, validarPrecos} from '../lib/precos';

export const URL_PRECOS =
  'https://raw.githubusercontent.com/juninmd/etanol-gasolina/master/data/precos.json';

export type Carregamento = {precos: Precos; origem: 'online' | 'embutido'};

const dadosEmbutidos = (): Precos => {
  const precos = validarPrecos(embutido);
  if (!precos) {
    throw new Error('Preços embutidos inválidos');
  }
  return precos;
};

/**
 * Busca a versão mais recente dos preços da ANP. Sem rede, com resposta
 * inválida ou mais antiga que a embutida no app, usa a embutida.
 */
export async function carregarPrecos(
  buscar: typeof fetch = fetch,
  tempoLimiteMs = 8000,
): Promise<Carregamento> {
  const local = dadosEmbutidos();
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), tempoLimiteMs);
  try {
    const resposta = await buscar(URL_PRECOS, {signal: controle.signal});
    if (!resposta.ok) {
      return {precos: local, origem: 'embutido'};
    }
    const online = validarPrecos(await resposta.json());
    if (online && online.semana.fim >= local.semana.fim) {
      return {precos: online, origem: 'online'};
    }
  } catch {
    // Sem conexão: segue com os dados embutidos.
  } finally {
    clearTimeout(timer);
  }
  return {precos: local, origem: 'embutido'};
}
