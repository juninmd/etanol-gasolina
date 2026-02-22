import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Button, Card, Input, Layout} from '@ui-kitten/components';
import {inject, observer} from 'mobx-react';
import HomeStore from '../../stores/home.store';
import StationsStore from '../../stores/stations.store';
import GarageStore from '../../stores/garage.store';
import ThemeStore from '../../stores/theme.store';

interface Props {
  homeStore?: HomeStore;
  stationsStore?: StationsStore;
  garageStore?: GarageStore;
  themeStore?: ThemeStore;
  navigation?: any;
}

@inject('homeStore', 'stationsStore', 'garageStore', 'themeStore')
@observer
class HomeWeb extends React.Component<Props> {

  handleSurpriseMe = () => {
    const {stationsStore, navigation} = this.props;
    if (!stationsStore) return;
    const {stations} = stationsStore;
    const promoStations = stations.filter(s => s.isPromo);
    const target = promoStations.length > 0
        ? promoStations[Math.floor(Math.random() * promoStations.length)]
        : stations[Math.floor(Math.random() * stations.length)];

    if (target) {
        alert(`🎁 SURPRESA! Encontramos uma oferta especial para você no ${target.name}.`);
        navigation.navigate('StationDetails', {stationId: target.id});
    }
  }

  render() {
    const {homeStore, garageStore} = this.props;

    if (!homeStore || !garageStore) {
      return (
        <View style={styles.container}>
          <Text style={styles.loading}>Carregando stores...</Text>
        </View>
      );
    }

    const {precoGasolina, precoEtanol, resultado, isCalculating} = homeStore;

    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>⛽ Calculadora Etanol vs Gasolina</Text>
          <Text style={styles.subtitle}>
            Descubra qual combustível é mais vantajoso
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Preço Gasolina (R$)</Text>
              <Input
                placeholder="Ex: 5.89"
                value={precoGasolina}
                onChangeText={homeStore.handlePrecoGasolina}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Preço Etanol (R$)</Text>
              <Input
                placeholder="Ex: 4.12"
                value={precoEtanol}
                onChangeText={homeStore.handlePrecoEtanol}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>

          <Button
            onPress={homeStore.calculate}
            disabled={isCalculating}
            style={styles.calculateButton}>
            {isCalculating ? 'Calculando...' : 'Calcular'}
          </Button>

          <Button
            onPress={() => this.props.navigation.navigate('TripPlanner')}
            style={[styles.calculateButton, {backgroundColor: '#3366FF', marginTop: 15}]}
            status="info">
            Trip Planner
          </Button>

          <Button
            onPress={this.handleSurpriseMe}
            style={[styles.calculateButton, {backgroundColor: '#FF3D71', marginTop: 15}]}
            status="success">
            Me Surpreenda 🎁
          </Button>
        </View>

        {resultado && (
          <View style={styles.resultSection}>
            <Card style={styles.resultCard}>
              <Text style={styles.resultTitle}>Resultado</Text>
              <Text style={styles.resultText}>{resultado}</Text>
              <Text style={styles.resultInfo}>
                Baseado na regra dos 70%: se o etanol custar até 70% do preço da
                gasolina, é mais vantajoso.
              </Text>
            </Card>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Como funciona?</Text>
          <Text style={styles.infoText}>
            • Etanol tem menor poder calorífico que a gasolina
          </Text>
          <Text style={styles.infoText}>
            • Regra geral: se etanol ≤ 70% do preço da gasolina, compensa
          </Text>
          <Text style={styles.infoText}>
            • Consideramos também o consumo do seu veículo
          </Text>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  loading: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  inputSection: {
    padding: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  calculateButton: {
    backgroundColor: '#667eea',
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 15,
  },
  resultSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
  },
  resultInfo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default HomeWeb;
