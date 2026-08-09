import React, {useState, useEffect} from 'react';
import {StyleSheet, View, ScrollView, Animated} from 'react-native';
import {Modal, Card, Text, Button, Icon, Input} from '@ui-kitten/components';
import StationsStore from '../stores/stations.store';
import GarageStore from '../stores/garage.store';

interface Props {
  visible: boolean;
  onClose: () => void;
  stationsStore: StationsStore;
  garageStore: GarageStore;
}

const RideVsCarModal = ({
  visible,
  onClose,
  stationsStore,
  garageStore,
}: Props) => {
  const [animation] = useState(new Animated.Value(0));
  const [distance, setDistance] = useState('');
  const [parkingCost, setParkingCost] = useState('');
  const [rideCost, setRideCost] = useState('');

  useEffect(() => {
    if (visible) {
      // Reward the user for discovering the easter egg
      const badge = stationsStore.badges.find((b) => b.id === 'smart_commuter');
      if (badge && !badge.unlocked) {
        badge.unlocked = true;
        stationsStore.badgeQueue.push(badge);
        stationsStore.addPoints(20);
      }

      Animated.spring(animation, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      animation.setValue(0);
      setDistance('');
      setParkingCost('');
      setRideCost('');
    }
  }, [visible, animation, stationsStore]);

  const calculateCosts = () => {
    const dist = parseFloat(distance.replace(',', '.')) || 0;
    const park = parseFloat(parkingCost.replace(',', '.')) || 0;
    const ride = parseFloat(rideCost.replace(',', '.')) || 0;

    if (dist === 0 || ride === 0) {
      return null;
    }

    // Get fuel cost
    const {marketAnalysis} = stationsStore;
    let pricePerLiter = marketAnalysis.avgGas;
    let consumption = garageStore.selectedVehicle?.avgGasConsumption || 10;
    let fuelType = 'Gasolina';

    if (marketAnalysis.bestFuel === 'Ethanol') {
      pricePerLiter = marketAnalysis.avgEthanol;
      consumption = garageStore.selectedVehicle?.avgEthanolConsumption || 7;
      fuelType = 'Etanol';
    }

    if (pricePerLiter === 0) {
      pricePerLiter = 5.0; // fallback
    }

    const fuelCost = (dist / consumption) * pricePerLiter;
    const totalCarCost = fuelCost + park;

    return {
      totalCarCost,
      rideCost: ride,
      fuelCost,
      fuelType,
      diff: Math.abs(totalCarCost - ride),
      isCarCheaper: totalCarCost < ride,
    };
  };

  const results = calculateCosts();

  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={onClose}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              {
                scale: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
            opacity: animation,
          },
        ]}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <Text category="h4" style={styles.title}>
              Vou de Quê? 🚗🚕
            </Text>
            <Text category="s1" style={styles.subtitle}>
              Carro próprio ou Aplicativo?
            </Text>
          </View>

          <ScrollView style={styles.content}>
            <Input
              placeholder="Distância da viagem (km)"
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
              style={styles.input}
              accessoryLeft={(props: any) => (
                <Icon {...props} name="navigation-2-outline" />
              )}
            />
            <Input
              placeholder="Preço estimado do App (R$)"
              value={rideCost}
              onChangeText={setRideCost}
              keyboardType="numeric"
              style={styles.input}
              accessoryLeft={(props: any) => (
                <Icon {...props} name="car-outline" />
              )}
            />
            <Input
              placeholder="Estacionamento (R$) - Opcional"
              value={parkingCost}
              onChangeText={setParkingCost}
              keyboardType="numeric"
              style={styles.input}
              accessoryLeft={(props: any) => (
                <Icon {...props} name="square-outline" />
              )}
            />

            {results && (
              <View style={styles.resultsContainer}>
                <View
                  style={[
                    styles.resultBox,
                    {borderColor: results.isCarCheaper ? '#00E096' : '#FF3D71'},
                  ]}>
                  <Text
                    category="h6"
                    style={{
                      color: results.isCarCheaper ? '#00E096' : '#FF3D71',
                      textAlign: 'center',
                      marginBottom: 10,
                    }}>
                    {results.isCarCheaper ? 'Vá com seu carro!' : 'Vá de App!'}
                  </Text>

                  <View style={styles.comparisonRow}>
                    <View style={styles.costCol}>
                      <Text category="s2" appearance="hint">
                        Carro Próprio
                      </Text>
                      <Text category="h6">
                        R$ {results.totalCarCost.toFixed(2)}
                      </Text>
                      <Text category="c1" appearance="hint">
                        Combustível: R$ {results.fuelCost.toFixed(2)} (
                        {results.fuelType})
                      </Text>
                    </View>
                    <View style={styles.costCol}>
                      <Text category="s2" appearance="hint">
                        App
                      </Text>
                      <Text category="h6">
                        R$ {results.rideCost.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <Text
                    category="s2"
                    style={{
                      textAlign: 'center',
                      marginTop: 10,
                      fontWeight: 'bold',
                    }}>
                    Economia de R$ {results.diff.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          <Button style={styles.button} onPress={onClose} status="primary">
            Fechar
          </Button>
        </Card>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    width: 340,
    maxWidth: '90%',
  },
  card: {
    borderRadius: 20,
    padding: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    color: '#3366FF',
  },
  subtitle: {
    color: '#8F9BB3',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    maxHeight: 400,
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    borderRadius: 12,
  },
  resultsContainer: {
    marginTop: 15,
  },
  resultBox: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#f8f9ff',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  costCol: {
    alignItems: 'center',
    flex: 1,
  },
});

export default RideVsCarModal;
