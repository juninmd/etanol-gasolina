import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Resultado} from '../lib/calculo';
import {formatarReais} from '../lib/precos';
import {useCores} from '../theme';

const pct = (n: number) => `${n.toFixed(1).replace('.', ',')}%`;

export default function ResultadoCard({
  resultado,
}: {
  resultado: Resultado | null;
}) {
  const cores = useCores();
  if (!resultado) {
    return (
      <View style={[styles.cartao, {backgroundColor: cores.cartao}]}>
        <Text style={[styles.aviso, {color: cores.suave}]}>
          Informe os preços da gasolina e do etanol para comparar.
        </Text>
      </View>
    );
  }
  const {custoKmEtanol, custoKmGasolina} = resultado;
  const cor = {color: cores.destaqueTexto};
  // Below 0.05% the saving prints as "0,0%": recommending one fuel then is noise.
  const empate = resultado.economiaPct < 0.05;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.cartao, {backgroundColor: cores.destaque}]}>
      <Text style={[styles.etiqueta, cor]}>
        {empate ? 'EMPATE' : 'MELHOR OPÇÃO'}
      </Text>
      <Text style={[styles.titulo, cor]}>
        {empate
          ? 'Tanto faz'
          : resultado.melhor === 'etanol'
          ? 'Abasteça com etanol'
          : 'Abasteça com gasolina'}
      </Text>
      <Text style={[styles.destaque, cor]}>
        {empate
          ? 'Os dois custam o mesmo por km rodado.'
          : `Economia de ${pct(resultado.economiaPct)} por km rodado.`}
      </Text>
      <Text style={[styles.detalhe, cor]}>
        O etanol custa {pct(resultado.razao * 100)} do preço da gasolina.
        {resultado.criterio === 'regra70'
          ? ' Regra prática: compensa até 70%.'
          : ''}
      </Text>
      {resultado.consumoIncompleto && (
        <Text style={[styles.detalhe, cor]}>
          Para comparar pelo custo por km, informe o consumo (km/l) dos dois
          combustíveis.
        </Text>
      )}
      {custoKmEtanol !== undefined && custoKmGasolina !== undefined && (
        <Text style={[styles.detalhe, cor]}>
          Custo por km: etanol {formatarReais(custoKmEtanol)} · gasolina{' '}
          {formatarReais(custoKmGasolina)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {borderRadius: 14, padding: 18},
  aviso: {fontSize: 16},
  etiqueta: {fontSize: 14, fontWeight: '600'},
  titulo: {fontSize: 32, fontWeight: '800'},
  destaque: {fontSize: 16, marginTop: 6},
  detalhe: {fontSize: 14, marginTop: 6},
});
