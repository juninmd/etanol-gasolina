import {carregarPostos, limparCachePostos} from '../postos.service';

const lista = {
  semana: {inicio: '2026-10-11', fim: '2026-10-17'},
  postos: [
    {
      nome: 'POSTO A',
      bandeira: 'BRANCA',
      endereco: 'RUA A, 10 - CENTRO',
      municipio: 'CAMPINAS',
      gasolina: 6.4,
      etanol: 3.9,
      coleta: '2026-10-20',
    },
  ],
};

const resposta = (corpo: unknown, ok = true) =>
  ({ok, json: async () => corpo} as Response);

describe('carregarPostos', () => {
  beforeEach(limparCachePostos);

  it('busca o arquivo da UF e guarda em cache', async () => {
    const buscar = jest.fn(async () => resposta(lista));
    expect(await carregarPostos('SP', buscar as any)).toEqual(lista);
    await carregarPostos('SP', buscar as any);
    expect(buscar).toHaveBeenCalledTimes(1);
    expect((buscar.mock.calls[0] as any[])[0]).toMatch(
      /data\/postos\/SP\.json$/,
    );
  });

  it('devolve null com erro de rede, HTTP ou JSON inválido', async () => {
    const falhas = [
      async () => {
        throw new Error('offline');
      },
      async () => resposta({}, false),
      async () => resposta({x: 1}),
    ];
    for (const falha of falhas) {
      expect(await carregarPostos('RJ', falha as any)).toBeNull();
    }
  });
});
