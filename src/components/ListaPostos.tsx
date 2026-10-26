import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {melhorPelaRegra} from '../lib/calculo';
import {formatarReais, nomeLegivel} from '../lib/precos';
import {Posto} from '../lib/postos';
import {EstadoPostos} from '../hooks/usePostos';
import {useCores} from '../theme';

type Props = {
  estado: EstadoPostos;
  postos: Posto[];
  onEscolher: (gasolina: number, etanol: number) => void;
};

const MENSAGENS: Partial<Record<EstadoPostos, string>> = {
  carregando: 'Buscando postos...',
  indisponivel: 'Lista de postos indisponível no momento.',
};

export default function ListaPostos({estado, postos, onEscolher}: Props) {
  const cores = useCores();
  if (estado === 'inativo') {
    return null;
  }
  const mensagem =
    MENSAGENS[estado] ??
    (postos.length ? null : 'A ANP não pesquisou postos nesta cidade.');

  return (
    <View style={styles.caixa}>
      <Text style={[styles.titulo, {color: cores.texto}]}>
        Postos mais baratos
      </Text>
      {mensagem && (
        <Text style={[styles.detalhe, {color: cores.suave}]}>{mensagem}</Text>
      )}
      {postos.map((p) => (
        <Pressable
          accessibilityHint="Usa os preços deste posto na comparação"
          accessibilityRole="button"
          key={`${p.nome}-${p.endereco}`}
          onPress={() => onEscolher(p.gasolina, p.etanol)}
          style={[
            styles.item,
            {backgroundColor: cores.cartao, borderColor: cores.borda},
          ]}>
          <Text style={[styles.nome, {color: cores.texto}]}>
            {nomeLegivel(p.nome)}
          </Text>
          <Text style={[styles.detalhe, {color: cores.suave}]}>
            {nomeLegivel(p.bandeira)} · {nomeLegivel(p.endereco)}
          </Text>
          <Text style={[styles.precos, {color: cores.texto}]}>
            Gasolina {formatarReais(p.gasolina)} · Etanol{' '}
            {formatarReais(p.etanol)}
          </Text>
          <Text style={[styles.melhor, {color: cores.destaque}]}>
            Compensa: {melhorPelaRegra(p.gasolina, p.etanol)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {marginTop: 24},
  titulo: {fontSize: 18, fontWeight: '700', marginBottom: 8},
  item: {borderRadius: 12, borderWidth: 1, marginBottom: 8, padding: 12},
  nome: {fontSize: 16, fontWeight: '600'},
  detalhe: {fontSize: 13, marginTop: 2},
  precos: {fontSize: 15, marginTop: 6},
  melhor: {fontSize: 14, fontWeight: '600', marginTop: 2},
});
