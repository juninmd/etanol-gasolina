import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Button, Card, Input, Layout} from '@ui-kitten/components';
import {inject, observer} from 'mobx-react';
import HomeStore from '../../stores/home.store';
import StationsStore from '../../stores/stations.store';
import GarageStore from '../../stores/garage.store';
import ThemeStore from '../../stores/theme.store';
import FuelMatchModal from '../../components/FuelMatchModal';
import FuelWrappedModal from '../../components/FuelWrappedModal';
import AICopilotModal from '../../components/AICopilotModal';
import TimeMachineModal from '../../components/TimeMachineModal';
import Caragotchi from '../../components/Caragotchi';
import ARPriceScannerModal from '../../components/ARPriceScannerModal';
import ChurrascometroModal from '../../components/ChurrascometroModal';
import RideVsCarModal from '../../components/RideVsCarModal';

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
  state = {
    showFuelMatch: false,
    showFuelWrapped: false,
    showCopilot: false,
    showTimeMachine: false,
    showARScanner: false,
    showChurrasco: false,
    showRideVsCar: false,
  };

  handleSurpriseMe = () => {
    this.setState({showRideVsCar: true});
  };

  handleFuelMatch = (stationId: number) => {
    const {stationsStore, navigation} = this.props;
    if (stationsStore) {
      stationsStore.addPoints(10);
    }
    navigation.navigate('StationDetails', {stationId});
  };

  render() {
    const {homeStore, garageStore, stationsStore} = this.props;

    if (!homeStore || !garageStore || !stationsStore) {
      return (
        <View style={styles.container}>
          <Text style={styles.loading}>Carregando stores...</Text>
        </View>
      );
    }

    const {gasolina, etanol, resultado, isCalculating} = homeStore;
    const {totalCO2Saved, treesPlanted} = stationsStore;

    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>⛽ Calculadora Etanol vs Gasolina</Text>
          <Text style={styles.subtitle}>
            Descubra qual combustível é mais vantajoso
          </Text>
        </View>

        {totalCO2Saved > 0 && (
          <View style={styles.ecoSection}>
            <Card style={styles.ecoCard}>
              <Text style={styles.ecoTitle}>🌍 Impacto Ambiental</Text>
              <Text style={styles.ecoSubtitle}>
                Ao escolher Etanol, você reduz a emissão de gases poluentes e
                ajuda o planeta!
              </Text>
              <View style={styles.ecoStatsRow}>
                <View style={styles.ecoStat}>
                  <Text style={styles.ecoValue}>
                    {totalCO2Saved.toFixed(1)}kg
                  </Text>
                  <Text style={styles.ecoLabel}>CO2 Evitado</Text>
                </View>
                <View style={styles.ecoStat}>
                  <Text style={styles.ecoValue}>{treesPlanted} 🌳</Text>
                  <Text style={styles.ecoLabel}>Árvores Salvas</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        <View style={{marginTop: 20}}>
          <Caragotchi stationsStore={stationsStore} />
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Preço Gasolina (R$)</Text>
              <Input
                placeholder="Ex: 5.89"
                value={gasolina}
                onChangeText={t => homeStore.handleForm({gasolina: t})}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Preço Etanol (R$)</Text>
              <Input
                placeholder="Ex: 4.12"
                value={etanol}
                onChangeText={t => homeStore.handleForm({etanol: t})}
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
            style={[
              styles.calculateButton,
              {backgroundColor: '#3366FF', marginTop: 15},
            ]}
            status="info">
            Trip Planner
          </Button>

          <Button
            onPress={this.handleSurpriseMe}
            style={[
              styles.calculateButton,
              {backgroundColor: '#FF3D71', marginTop: 15},
            ]}
            status="success">
            Me Surpreenda 🎁
          </Button>

          <Button
            onPress={() => this.setState({showFuelWrapped: true})}
            style={[
              styles.calculateButton,
              {backgroundColor: '#FFD700', marginTop: 15},
            ]}
            status="warning">
            Sua Retrospectiva 🎉
          </Button>

          <Button
            onPress={() => this.setState({showCopilot: true})}
            style={[
              styles.calculateButton,
              {backgroundColor: '#00E096', marginTop: 15},
            ]}
            status="success">
            AI Copilot 🤖
          </Button>

          <Button
            onPress={() => this.setState({showTimeMachine: true})}
            style={[
              styles.calculateButton,
              {backgroundColor: '#9C27B0', marginTop: 15},
            ]}
            status="primary">
            Máquina do Tempo ⏰
          </Button>

          <Button
            onPress={() => this.setState({showARScanner: true})}
            style={[
              styles.calculateButton,
              {backgroundColor: '#FF8C00', marginTop: 15},
            ]}
            status="primary">
            Scanner de Preços AR 📸
          </Button>

          <Button
            onPress={() => this.setState({showChurrasco: true})}
            style={[
              styles.calculateButton,
              {backgroundColor: '#FF3D71', marginTop: 15},
            ]}
            status="danger">
            Churrascómetro 🔥
          </Button>
        </View>

        {resultado && (
          <View style={styles.resultSection}>
            <Card style={styles.resultCard}>
              <Text style={styles.resultTitle}>Resultado</Text>
              {homeStore.recommendation === 'bicycle' ? (
                <Text
                  style={[styles.resultText, {color: '#00E096', fontSize: 24}]}>
                  🚲 {resultado}
                </Text>
              ) : (
                <Text style={styles.resultText}>{resultado}</Text>
              )}
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

        <FuelMatchModal
          visible={this.state.showFuelMatch}
          onClose={() => this.setState({showFuelMatch: false})}
          stations={stationsStore.stations.slice()}
          onMatch={this.handleFuelMatch}
        />

        <FuelWrappedModal
          visible={this.state.showFuelWrapped}
          onClose={() => this.setState({showFuelWrapped: false})}
          stationsStore={stationsStore}
        />

        <AICopilotModal
          visible={this.state.showCopilot}
          onClose={() => this.setState({showCopilot: false})}
          stationsStore={stationsStore}
        />

        <TimeMachineModal
          visible={this.state.showTimeMachine}
          onClose={() => this.setState({showTimeMachine: false})}
        />

        <ARPriceScannerModal
          visible={this.state.showARScanner}
          onClose={() => this.setState({showARScanner: false})}
          stationsStore={stationsStore}
        />

        <ChurrascometroModal
          visible={this.state.showChurrasco}
          onClose={() => this.setState({showChurrasco: false})}
          stationsStore={stationsStore}
        />

        <RideVsCarModal
          visible={this.state.showRideVsCar}
          onClose={() => this.setState({showRideVsCar: false})}
          stationsStore={stationsStore}
          garageStore={garageStore}
        />
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
  ecoSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  ecoCard: {
    backgroundColor: '#E5F9F1',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#00E096',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderColor: '#00E096',
    borderWidth: 1,
  },
  ecoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00E096',
    marginBottom: 5,
  },
  ecoSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  ecoStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ecoStat: {
    alignItems: 'center',
  },
  ecoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00E096',
  },
  ecoLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default HomeWeb;
