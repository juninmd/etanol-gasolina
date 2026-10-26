import {StyleSheet, useColorScheme} from 'react-native';

const claro = {
  fundo: '#f5f7fa',
  cartao: '#ffffff',
  texto: '#1a2433',
  suave: '#5b6778',
  borda: '#d5dbe4',
  destaque: '#0a7d3b',
  destaqueTexto: '#ffffff',
  alerta: '#b45309',
};

const escuro: typeof claro = {
  fundo: '#10151c',
  cartao: '#1b222c',
  texto: '#f0f3f7',
  suave: '#a2adbd',
  borda: '#2f3945',
  destaque: '#34c26b',
  destaqueTexto: '#06210f',
  alerta: '#f5a524',
};

export const useCores = () => (useColorScheme() === 'dark' ? escuro : claro);
export type Cores = typeof claro;

export const base = StyleSheet.create({
  campo: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 18,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  rotulo: {fontSize: 14, fontWeight: '600', marginBottom: 6},
});
