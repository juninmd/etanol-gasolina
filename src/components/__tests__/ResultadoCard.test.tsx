import React from 'react';
import renderer from 'react-test-renderer';
import {Text} from 'react-native';
import ResultadoCard from '../ResultadoCard';
import {compararCombustiveis} from '../../lib/calculo';

const textos = (tree: renderer.ReactTestRenderer) =>
  tree.root
    .findAllByType(Text)
    .map((t) => [t.props.children].flat().join(''))
    .join(' ');

describe('ResultadoCard', () => {
  it('avisa quando só um consumo foi informado e a regra dos 70% foi usada', () => {
    const resultado = compararCombustiveis({
      precoGasolina: 6.5,
      precoEtanol: 4.2,
      consumoEtanol: 9,
    });
    const tree = renderer.create(<ResultadoCard resultado={resultado} />);
    expect(textos(tree)).toContain('informe o consumo (km/l) dos dois');
  });

  it('não mostra o aviso com os dois consumos', () => {
    const resultado = compararCombustiveis({
      precoGasolina: 6.5,
      precoEtanol: 4.2,
      consumoGasolina: 12,
      consumoEtanol: 9,
    });
    const tree = renderer.create(<ResultadoCard resultado={resultado} />);
    expect(textos(tree)).not.toContain('informe o consumo');
    expect(textos(tree)).toContain('Custo por km');
  });
});
