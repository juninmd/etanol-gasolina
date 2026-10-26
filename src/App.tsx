import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import CampoNumero from './components/CampoNumero';
import ListaPostos from './components/ListaPostos';
import ResultadoCard from './components/ResultadoCard';
import Seletor from './components/Seletor';
import {compararCombustiveis, lerNumero} from './lib/calculo';
import {formatarSemana} from './lib/precos';
import useLocalPrecos, {BRASIL} from './hooks/useLocalPrecos';
import usePostos from './hooks/usePostos';
import {Carregamento} from './services/precos.service';
import {useCores} from './theme';

const descreverFonte = (dados: Carregamento | null) => {
  if (!dados) {
    return 'Carregando preços da ANP...';
  }
  const semana = formatarSemana(dados.precos.semana);
  const aviso =
    dados.origem === 'embutido' ? ' (sem conexão, dados salvos no app)' : '';
  return `Preços médios de revenda da ANP, semana de ${semana}${aviso}.`;
};

export default function App() {
  const cores = useCores();
  const esquema = useColorScheme();
  const local = useLocalPrecos();
  const {dados, estado, uf, cidade, gasolina, etanol} = local;
  const postos = usePostos(uf, cidade);
  const [kmGasolina, setKmGasolina] = useState('');
  const [kmEtanol, setKmEtanol] = useState('');

  const resultado = compararCombustiveis({
    precoGasolina: lerNumero(gasolina),
    precoEtanol: lerNumero(etanol),
    consumoGasolina: lerNumero(kmGasolina),
    consumoEtanol: lerNumero(kmEtanol),
  });

  const nota = [styles.nota, {color: cores.suave}];

  return (
    <SafeAreaView
      style={[
        styles.tela,
        {
          backgroundColor: cores.fundo,
          paddingTop: RNStatusBar.currentHeight ?? 0,
        },
      ]}>
      <StatusBar style={esquema === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.titulo, {color: cores.texto}]}>
          Etanol ou gasolina?
        </Text>
        <Text style={[styles.subtitulo, {color: cores.suave}]}>
          Compare os preços e veja qual combustível compensa.
        </Text>

        <Seletor
          onChange={local.escolherEstado}
          opcoes={local.opcoesEstado}
          placeholder="Brasil (média nacional)"
          rotulo="Estado"
          valor={uf ?? BRASIL}
        />
        <Seletor
          desabilitado={!estado}
          onChange={local.escolherCidade}
          opcoes={local.opcoesCidade}
          placeholder={estado ? 'Média do estado' : 'Escolha um estado'}
          rotulo="Cidade"
          valor={cidade}
        />

        <View style={styles.linha}>
          <CampoNumero
            onChange={local.setGasolina}
            rotulo="Gasolina (R$/L)"
            valor={gasolina}
          />
          <CampoNumero
            onChange={local.setEtanol}
            rotulo="Etanol (R$/L)"
            valor={etanol}
          />
        </View>
        <View style={[styles.linha, styles.linhaFinal]}>
          <CampoNumero
            onChange={setKmGasolina}
            placeholder="opcional"
            rotulo="Gasolina (km/l)"
            valor={kmGasolina}
          />
          <CampoNumero
            onChange={setKmEtanol}
            placeholder="opcional"
            rotulo="Etanol (km/l)"
            valor={kmEtanol}
          />
        </View>

        <ResultadoCard resultado={resultado} />

        <ListaPostos
          estado={postos.estado}
          onEscolher={local.preencher}
          postos={postos.postos}
        />

        <Text style={[nota, styles.notaTopo]}>{descreverFonte(dados)}</Text>
        <Text style={nota}>
          Os preços variam de posto para posto: ajuste os campos com o valor da
          bomba.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {flex: 1},
  conteudo: {padding: 16},
  titulo: {fontSize: 26, fontWeight: '800', marginBottom: 4},
  subtitulo: {fontSize: 15, marginBottom: 18},
  linha: {flexDirection: 'row', gap: 12, marginBottom: 14},
  linhaFinal: {marginBottom: 20},
  nota: {fontSize: 13, marginTop: 4},
  notaTopo: {marginTop: 20},
});
