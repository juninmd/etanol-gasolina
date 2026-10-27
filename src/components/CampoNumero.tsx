import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {base, useCores} from '../theme';

type Props = {
  rotulo: string;
  valor: string;
  placeholder?: string;
  onChange: (texto: string) => void;
};

export default function CampoNumero({
  rotulo,
  valor,
  placeholder,
  onChange,
}: Props) {
  const cores = useCores();
  return (
    <View style={styles.caixa}>
      <Text style={[base.rotulo, {color: cores.suave}]}>{rotulo}</Text>
      <TextInput
        accessibilityLabel={rotulo}
        keyboardType="decimal-pad"
        onChangeText={(texto) => onChange(texto.replace(/[^0-9.,]/g, ''))}
        placeholder={placeholder}
        placeholderTextColor={cores.suave}
        style={[
          base.campo,
          {
            backgroundColor: cores.cartao,
            borderColor: cores.borda,
            color: cores.texto,
          },
        ]}
        value={valor}
      />
    </View>
  );
}

const styles = StyleSheet.create({caixa: {flex: 1}});
