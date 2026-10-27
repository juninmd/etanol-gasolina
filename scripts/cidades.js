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

/**
 * Todas as cidades da UF (lista do IBGE). As pesquisadas pela ANP levam
 * preços; as demais ficam só com o nome e usam a média do estado no app.
 */
function listarCidades(nomeAnp, ibge, pesquisadas) {
  const cidades = new Map();
  for (const nome of ibge ?? []) {
    cidades.set(normalizar(nome), {nome});
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
  return [...cidades.values()].sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR'),
  );
}

module.exports = {completo, listarCidades, normalizar};
