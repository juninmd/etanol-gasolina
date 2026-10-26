import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Text, TextInput} from 'react-native';
import App from '../App';

const textos = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).map((t) => [t.props.children].flat().join(''));

describe('App (smoke)', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as any;
  });

  it('abre com a média nacional da ANP e mostra o resultado', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<App />);
    });
    const campos = tree.root.findAllByType(TextInput).map((i) => i.props.value);
    expect(campos.slice(0, 2)).toEqual(['6,53', '4,11']);
    const saida = textos(tree).join('|');
    expect(saida).toContain('MELHOR OPÇÃO');
    expect(saida).toContain('Preços médios de revenda da ANP');
    expect(saida).toContain('sem conexão');
    act(() => tree.unmount());
  });
});
