import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Pressable, TextInput} from 'react-native';
import Seletor from '../Seletor';

const opcoes = [
  {valor: 'SP', rotulo: 'São Paulo (SP)'},
  {valor: 'MG', rotulo: 'Minas Gerais (MG)'},
];

describe('Seletor (acessibilidade)', () => {
  it('rotula a busca e marca a opção atual como selecionada', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <Seletor
          onChange={() => {}}
          opcoes={opcoes}
          placeholder="Escolha"
          rotulo="Estado"
          valor="MG"
        />,
      );
    });
    act(() => {
      tree.root.findAllByType(Pressable)[0].props.onPress();
    });
    expect(tree.root.findByType(TextInput).props.accessibilityLabel).toBe(
      'Buscar estado',
    );
    const itens = tree.root
      .findAllByType(Pressable)
      .filter((p) => p.props.accessibilityState?.selected !== undefined);
    expect(itens.map((p) => p.props.accessibilityState.selected)).toEqual([
      false,
      true,
    ]);
    act(() => tree.unmount());
  });
});
