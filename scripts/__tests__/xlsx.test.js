const {lerXlsx} = require('../xlsx');

// Monta um zip (sem compressão) com os arquivos informados.
function zip(arquivos) {
  const locais = [];
  const centrais = [];
  let deslocamento = 0;
  for (const [nome, conteudo] of Object.entries(arquivos)) {
    const n = Buffer.from(nome);
    const dados = Buffer.from(conteudo);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt32LE(dados.length, 18);
    local.writeUInt32LE(dados.length, 22);
    local.writeUInt16LE(n.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt32LE(dados.length, 20);
    central.writeUInt32LE(dados.length, 24);
    central.writeUInt16LE(n.length, 28);
    central.writeUInt32LE(deslocamento, 42);
    locais.push(local, n, dados);
    centrais.push(central, n);
    deslocamento += 30 + n.length + dados.length;
  }
  const dirCentral = Buffer.concat(centrais);
  const fim = Buffer.alloc(22);
  fim.writeUInt32LE(0x06054b50, 0);
  fim.writeUInt16LE(Object.keys(arquivos).length, 10);
  fim.writeUInt32LE(dirCentral.length, 12);
  fim.writeUInt32LE(deslocamento, 16);
  return Buffer.concat([...locais, dirCentral, fim]);
}

const xlsx = zip({
  'xl/workbook.xml':
    '<workbook><sheets><sheet name="BRASIL" sheetId="1" r:id="rId1"/></sheets></workbook>',
  'xl/_rels/workbook.xml.rels':
    '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>',
  'xl/sharedStrings.xml':
    '<sst><si><t>GASOLINA &amp; CIA</t></si><si><t>ETANOL</t></si></sst>',
  'xl/worksheets/sheet1.xml':
    '<worksheet><sheetData>' +
    '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="C1"><v>6.53</v></c></row>' +
    '<row r="2"><c r="B2" t="inlineStr"><is><t>texto</t></is></c><c r="C2" t="s"><v>1</v></c></row>' +
    '</sheetData></worksheet>',
});

describe('lerXlsx', () => {
  it('lê textos compartilhados, números e células vazias', () => {
    const {BRASIL} = lerXlsx(xlsx);
    expect(BRASIL[0]).toEqual(['GASOLINA & CIA', undefined, 6.53]);
    expect(BRASIL[1]).toEqual([undefined, 'texto', 'ETANOL']);
  });

  it('rejeita arquivo que não é zip', () => {
    expect(() => lerXlsx(Buffer.from('nada'))).toThrow('zip');
  });
});
