// Lista de cidades por UF: nomes do IBGE + preços das pesquisadas pela ANP.
const completo = (item) => item && item.gasolina && item.etanol;

/** "São João del-Rei" -> "SAO JOAO DEL REI": mesma grafia da ANP. */
const normalizar = (nome) =>
  nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

const titulo = (nome) =>
  nome
    .toLowerCase()
    .split(' ')
    .map((p, i) =>
      i > 0 && ['de', 'do', 'da', 'dos', 'das', 'e'].includes(p)
        ? p
        : p.charAt(0).toUpperCase() + p.slice(1),
    )
    .join(' ');

// Além disso a cidade pesquisada mais próxima deixa de ser referência útil.
const RAIO_MAX_KM = 150;

function distanciaKm(a, b) {
  const rad = (g) => (g * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) *
      Math.cos(rad(b.lat)) *
      Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/**
 * Todas as cidades da UF (lista do IBGE: [nome, lat, lon]). As pesquisadas
 * pela ANP levam preços. As demais levam `ref`/`km`: a cidade pesquisada
 * mais próxima do mesmo estado (até RAIO_MAX_KM), usada como estimativa.
 */
function listarCidades(nomeAnp, ibge, pesquisadas) {
  const cidades = new Map();
  for (const [nome, lat, lon] of ibge ?? []) {
    cidades.set(normalizar(nome), {nome, lat, lon});
  }
  for (const [chave, v] of pesquisadas) {
    if (!chave.startsWith(`${nomeAnp}|`) || !completo(v)) {
      continue;
    }
    const cidade = chave.slice(nomeAnp.length + 1);
    const normal = normalizar(cidade);
    const base = cidades.get(normal) ?? {nome: titulo(cidade)};
    cidades.set(normal, {
      ...base,
      gasolina: v.gasolina,
      etanol: v.etanol,
      postos: v.postos,
    });
  }
  const lista = [...cidades.values()];
  const pesquisadasComLocal = lista.filter(
    (c) => c.gasolina && c.lat !== undefined,
  );
  return lista
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    .map(({lat, lon, ...cidade}) => {
      if (cidade.gasolina || lat === undefined) {
        return cidade;
      }
      let melhor = null;
      for (const outra of pesquisadasComLocal) {
        const km = distanciaKm({lat, lon}, outra);
        if (!melhor || km < melhor.km) {
          melhor = {nome: outra.nome, km};
        }
      }
      return melhor && melhor.km <= RAIO_MAX_KM
        ? {...cidade, ref: melhor.nome, km: Math.round(melhor.km)}
        : cidade;
    });
}

module.exports = {completo, listarCidades, normalizar, RAIO_MAX_KM};
