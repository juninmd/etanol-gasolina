import embutido from '../../../data/precos.json';
import {carregarPrecos} from '../precos.service';

const resposta = (corpo: unknown, ok = true) =>
  ({ok, json: async () => corpo} as Response);

describe('carregarPrecos', () => {
  it('usa os dados online quando são válidos e recentes', async () => {
    const novo = {
      ...embutido,
      semana: {inicio: '2099-01-01', fim: '2099-01-07'},
    };
    const r = await carregarPrecos(async () => resposta(novo));
    expect(r.origem).toBe('online');
    expect(r.precos.semana.fim).toBe('2099-01-07');
  });

  it('usa os dados embutidos sem conexão', async () => {
    const r = await carregarPrecos(async () => {
      throw new Error('offline');
    });
    expect(r.origem).toBe('embutido');
  });

  it('ignora resposta com erro, inválida ou mais antiga', async () => {
    const antigo = {
      ...embutido,
      semana: {inicio: '2000-01-01', fim: '2000-01-07'},
    };
    for (const r of [resposta({}, false), resposta({x: 1}), resposta(antigo)]) {
      const carregado = await carregarPrecos(async () => r);
      expect(carregado.origem).toBe('embutido');
    }
  });
});
