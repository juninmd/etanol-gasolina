import {Posto, postosDaCidade, validarPostos} from '../postos';

const posto = (
  nome: string,
  municipio: string,
  g: number,
  e: number,
): Posto => ({
  nome,
  bandeira: 'BRANCA',
  endereco: 'RUA A, 10 - CENTRO',
  municipio,
  gasolina: g,
  etanol: e,
  coleta: '2026-10-20',
});

const lista = {
  semana: {inicio: '2026-10-11', fim: '2026-10-17'},
  postos: [
    posto('CARO', 'CAMPINAS', 6.5, 4.9),
    posto('BARATO', 'CAMPINAS', 6.4, 3.9),
    posto('OUTRA CIDADE', 'SUMARE', 5.0, 3.0),
    posto('MEDIO', 'CAMPINAS', 6.4, 4.4),
  ],
};

describe('postosDaCidade', () => {
  it('filtra o município e ordena pelo menor custo efetivo', () => {
    const nomes = postosDaCidade(lista, 'CAMPINAS').map((p) => p.nome);
    expect(nomes).toEqual(['BARATO', 'MEDIO', 'CARO']);
  });

  it('respeita o limite e devolve vazio sem dados ou cidade', () => {
    expect(postosDaCidade(lista, 'CAMPINAS', 2)).toHaveLength(2);
    expect(postosDaCidade(null, 'CAMPINAS')).toEqual([]);
    expect(postosDaCidade(lista, null)).toEqual([]);
  });
});

describe('validarPostos', () => {
  it('aceita o formato gerado pelo script', () => {
    expect(validarPostos(lista)).toBe(lista);
  });

  it('rejeita posto com preço inválido ou formato errado', () => {
    expect(validarPostos(null)).toBeNull();
    expect(validarPostos({semana: lista.semana, postos: 'x'})).toBeNull();
    expect(
      validarPostos({...lista, postos: [posto('X', 'Y', 0, 4)]}),
    ).toBeNull();
  });
});
