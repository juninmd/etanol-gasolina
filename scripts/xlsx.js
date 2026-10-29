// Leitor mínimo de .xlsx (zip + XML) para não depender de bibliotecas com CVEs.
const zlib = require('zlib');

function lerZip(buffer) {
  const fim = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (fim < 0) {
    throw new Error('Arquivo não é um zip válido');
  }
  const total = buffer.readUInt16LE(fim + 10);
  let pos = buffer.readUInt32LE(fim + 16);
  const arquivos = {};
  for (let i = 0; i < total; i++) {
    const metodo = buffer.readUInt16LE(pos + 10);
    const tamanho = buffer.readUInt32LE(pos + 20);
    const nomeLen = buffer.readUInt16LE(pos + 28);
    const extraLen = buffer.readUInt16LE(pos + 30);
    const comentLen = buffer.readUInt16LE(pos + 32);
    const local = buffer.readUInt32LE(pos + 42);
    const nome = buffer.toString('utf8', pos + 46, pos + 46 + nomeLen);
    const dadosIni =
      local +
      30 +
      buffer.readUInt16LE(local + 26) +
      buffer.readUInt16LE(local + 28);
    const bruto = buffer.subarray(dadosIni, dadosIni + tamanho);
    arquivos[nome] = metodo === 0 ? bruto : zlib.inflateRawSync(bruto);
    pos += 46 + nomeLen + extraLen + comentLen;
  }
  return arquivos;
}

const decodificar = (texto) =>
  texto
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

function lerStringsCompartilhadas(xml) {
  if (!xml) {
    return [];
  }
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(([, si]) =>
    decodificar(
      [...si.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join(''),
    ),
  );
}

function indiceColuna(ref) {
  return (
    [...ref.replace(/\d+/g, '')].reduce(
      (acc, c) => acc * 26 + c.charCodeAt(0) - 64,
      0,
    ) - 1
  );
}

function lerPlanilha(xml, strings) {
  const linhas = [];
  for (const [, corpo] of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const linha = [];
    for (const [, attrs, interno] of corpo.matchAll(
      /<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g,
    )) {
      const ref = /r="([A-Z]+\d+)"/.exec(attrs)[1];
      const tipo = /t="(\w+)"/.exec(attrs)?.[1];
      const valor = /<v>([\s\S]*?)<\/v>/.exec(interno || '')?.[1];
      let conteudo = null;
      if (tipo === 's' && valor !== undefined) {
        conteudo = strings[Number(valor)];
      } else if (tipo === 'inlineStr') {
        conteudo = decodificar(
          /<t[^>]*>([\s\S]*?)<\/t>/.exec(interno)?.[1] ?? '',
        );
      } else if (valor !== undefined) {
        conteudo = tipo === 'str' ? decodificar(valor) : Number(valor);
      }
      linha[indiceColuna(ref)] = conteudo;
    }
    linhas.push(linha);
  }
  return linhas;
}

/** Devolve {nomeDaAba: linhas[][]} de um buffer .xlsx. */
function lerXlsx(buffer) {
  const arquivos = lerZip(buffer);
  const texto = (nome) => arquivos[nome]?.toString('utf8');
  const strings = lerStringsCompartilhadas(texto('xl/sharedStrings.xml'));
  const rels = {};
  for (const [, tag] of texto('xl/_rels/workbook.xml.rels').matchAll(
    /<Relationship ([^>]*)\/?>/g,
  )) {
    rels[/Id="([^"]+)"/.exec(tag)[1]] = /Target="([^"]+)"/.exec(tag)[1];
  }
  const abas = {};
  for (const [, tag] of texto('xl/workbook.xml').matchAll(
    /<sheet ([^>]*)\/?>/g,
  )) {
    const nome = decodificar(/name="([^"]+)"/.exec(tag)[1]);
    const alvo = rels[/r:id="([^"]+)"/.exec(tag)[1]].replace(
      /^\/?(xl\/)?/,
      'xl/',
    );
    abas[nome] = lerPlanilha(texto(alvo), strings);
  }
  return abas;
}

module.exports = {lerXlsx};
