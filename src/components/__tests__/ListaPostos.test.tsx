import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Pressable, Text} from 'react-native';
import ListaPostos from '../ListaPostos';

const posto = {
  nome: 'AUTO POSTO DO ZE',
  bandeira: 'BRANCA',
  endereco: 'RUA A, 10 - CENTRO',
  municipio: 'CAMPINAS',
  gasolina: 6.4,
  etanol: 3.9,
  coleta: '2026-10-20',
};

const textos = (t: renderer.ReactTestRenderer) =>
  t.root.findAllByType(Text).map((x) => [x.props.children].flat().join(''));

describe('ListaPostos', () => {
  it('não mostra nada sem cidade escolhida', () => {
    const t = renderer.create(
      <ListaPostos estado="inativo" onEscolher={jest.fn()} postos={[]} />,
    );
    expect(t.toJSON()).toBeNull();
  });

  it('lista postos e devolve os preços ao tocar', () => {
    const onEscolher = jest.fn();
    let t!: renderer.ReactTestRenderer;
    act(() => {
      t = renderer.create(
        <ListaPostos estado="ok" onEscolher={onEscolher} postos={[posto]} />,
      );
    });
    const saida = textos(t).join('|');
    expect(saida).toContain('Auto Posto do Ze');
    expect(saida).toContain('Gasolina R$ 6,40 · Etanol R$ 3,90');
    expect(saida).toContain('Compensa: etanol');
    act(() => t.root.findByType(Pressable).props.onPress());
    expect(onEscolher).toHaveBeenCalledWith(6.4, 3.9);
  });

  it('avisa quando a lista está indisponível ou vazia', () => {
    const indisponivel = renderer.create(
      <ListaPostos estado="indisponivel" onEscolher={jest.fn()} postos={[]} />,
    );
    expect(textos(indisponivel).join('|')).toContain('indisponível');
    const vazia = renderer.create(
      <ListaPostos estado="ok" onEscolher={jest.fn()} postos={[]} />,
    );
    expect(textos(vazia).join('|')).toContain('não pesquisou');
  });
});
