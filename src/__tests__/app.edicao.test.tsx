import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {TextInput} from 'react-native';
import App from '../App';
import dados from '../../data/precos.json';
import {precoParaTexto} from '../lib/precos';

const campos = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAllByType(TextInput).map((i) => i.props.value);

describe('App (preços digitados)', () => {
  it('não sobrescreve o que o usuário digitou quando os preços online chegam depois', async () => {
    let liberar!: () => void;
    const online = {
      ...dados,
      semana: {...dados.semana, fim: '2999-12-31'},
      brasil: {...dados.brasil, gasolina: 9.99, etanol: 8.88},
    };
    global.fetch = jest.fn(
      () =>
        new Promise((resolve) => {
          liberar = () => resolve({ok: true, json: async () => online});
        }),
    ) as any;

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<App />);
    });
    await act(async () => {
      tree.root.findAllByType(TextInput)[0].props.onChangeText('7,07');
    });
    await act(async () => {
      liberar();
    });

    expect(campos(tree)[0]).toBe('7,07');
    // O campo que o usuário não tocou continua recebendo o preço da ANP.
    expect(campos(tree)[1]).toBe(precoParaTexto(online.brasil.etanol));
    act(() => tree.unmount());
  });
});
