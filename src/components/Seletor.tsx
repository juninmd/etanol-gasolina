import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {base, useCores} from '../theme';

export type Opcao = {valor: string; rotulo: string};

type Props = {
  rotulo: string;
  placeholder: string;
  opcoes: Opcao[];
  valor: string | null;
  desabilitado?: boolean;
  onChange: (valor: string) => void;
};

const semAcento = (t: string) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Seletor({
  rotulo,
  placeholder,
  opcoes,
  valor,
  desabilitado,
  onChange,
}: Props) {
  const cores = useCores();
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const atual = opcoes.find((o) => o.valor === valor);
  const filtradas = useMemo(() => {
    const termo = semAcento(busca);
    return opcoes.filter((o) => semAcento(o.rotulo).includes(termo));
  }, [opcoes, busca]);

  const fechar = () => {
    setAberto(false);
    setBusca('');
  };

  const campo = {backgroundColor: cores.cartao, borderColor: cores.borda};

  return (
    <View style={styles.caixa}>
      <Text style={[base.rotulo, {color: cores.suave}]}>{rotulo}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${rotulo}: ${atual?.rotulo ?? placeholder}`}
        disabled={desabilitado}
        onPress={() => setAberto(true)}
        style={[
          base.campo,
          styles.botao,
          campo,
          desabilitado ? styles.desabilitado : null,
        ]}>
        <Text
          style={[styles.valor, {color: atual ? cores.texto : cores.suave}]}>
          {atual?.rotulo ?? placeholder}
        </Text>
      </Pressable>

      <Modal animationType="slide" visible={aberto} onRequestClose={fechar}>
        <View style={[styles.modal, {backgroundColor: cores.fundo}]}>
          <Text style={[styles.titulo, {color: cores.texto}]}>{rotulo}</Text>
          <TextInput
            autoCorrect={false}
            onChangeText={setBusca}
            placeholder="Buscar"
            placeholderTextColor={cores.suave}
            style={[base.campo, campo, {color: cores.texto}]}
            value={busca}
          />
          <FlatList
            data={filtradas}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(o) => o.valor}
            ListEmptyComponent={
              <Text style={[styles.vazio, {color: cores.suave}]}>
                Nenhum resultado.
              </Text>
            }
            renderItem={({item}) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onChange(item.valor);
                  fechar();
                }}
                style={[styles.item, {borderBottomColor: cores.borda}]}>
                <Text style={[styles.itemTexto, {color: cores.texto}]}>
                  {item.rotulo}
                </Text>
              </Pressable>
            )}
          />
          <Pressable
            accessibilityRole="button"
            onPress={fechar}
            style={styles.fechar}>
            <Text style={[styles.fecharTexto, {color: cores.destaque}]}>
              Fechar
            </Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {marginBottom: 14},
  botao: {justifyContent: 'center'},
  desabilitado: {opacity: 0.5},
  valor: {fontSize: 18},
  modal: {flex: 1, padding: 16, paddingTop: 48},
  titulo: {fontSize: 20, fontWeight: '700', marginBottom: 12},
  vazio: {padding: 16},
  item: {borderBottomWidth: 1, padding: 16},
  itemTexto: {fontSize: 17},
  fechar: {alignItems: 'center', padding: 16},
  fecharTexto: {fontSize: 17, fontWeight: '600'},
});
