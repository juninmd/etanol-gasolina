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

describe('ResultadoCard (empate)', () => {
  it('não recomenda um combustível com "economia de 0,0%" no empate exato dos 70%', () => {
    const resultado = compararCombustiveis({
      precoGasolina: 7,
      precoEtanol: 4.9,
    });
    const tree = renderer.create(<ResultadoCard resultado={resultado} />);
    const texto = textos(tree);
    expect(texto).toContain('Tanto faz');
    expect(texto).not.toContain('Economia de 0,0%');
    expect(texto).not.toContain('MELHOR OPÇÃO');
  });

  it('mantém a recomendação quando há diferença', () => {
    const resultado = compararCombustiveis({
      precoGasolina: 6.5,
      precoEtanol: 4.2,
    });
    const tree = renderer.create(<ResultadoCard resultado={resultado} />);
    expect(textos(tree)).toContain('Abasteça com etanol');
    expect(textos(tree)).toContain('Economia de 7,7% por km rodado.');
  });
});
