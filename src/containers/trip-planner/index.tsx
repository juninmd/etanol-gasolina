import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Keyboard,
  Platform,
} from 'react-native';
import {
  Layout,
  Text,
  Input,
  Button,
  Icon,
  Card,
  TopNavigation,
  TopNavigationAction,
  Divider,
} from '@ui-kitten/components';
import {inject, observer} from 'mobx-react';
import MapView, {Marker, Polyline} from '../../components/MapWrapper';
import StationsStore from '../../stores/stations.store';

interface Props {
  navigation: any;
  stationsStore: StationsStore;
}

const BackIcon = (props: any) => <Icon {...props} name="arrow-back" />;

@inject('stationsStore')
@observer
export default class TripPlanner extends React.Component<Props> {
  state = {
    destination: '',
    distance: '',
    isCalculating: false,
    routeFound: false,
    savings: 0,
    bestStop: null as any,
  };

  mapRef: any = null;

  navigateBack = () => {
    this.props.navigation.goBack();
  };

  renderBackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={this.navigateBack} />
  );

  handleCalculate = () => {
    Keyboard.dismiss();
    const {destination, distance} = this.state;
    if (!destination || !distance) {
      return;
    }

    this.setState({isCalculating: true});

    // Simulate API call
    setTimeout(() => {
      const {stationsStore} = this.props;
      // Pick a random station as the "best stop"
      const stations = stationsStore.stations;
      const bestStop =
        stations.length > 0
          ? stations[Math.floor(Math.random() * stations.length)]
          : null;

      const distVal = parseFloat(distance.replace(',', '.'));
      const savings = bestStop ? (distVal / 10) * 0.5 : 0; // Mock savings calculation

      this.setState({
        isCalculating: false,
        routeFound: true,
        bestStop,
        savings,
      });

      // Zoom map to show route (mock)
      if (this.mapRef && bestStop) {
        this.mapRef.animateToRegion(
          {
            latitude: bestStop.latitude,
            longitude: bestStop.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          },
          1000,
        );
      }
    }, 2000);
  };

  render() {
    const {
      destination,
      distance,
      isCalculating,
      routeFound,
      bestStop,
      savings,
    } = this.state;

    // Mock Route Coordinates (passing through the best station or generic)
    const startCoords = {latitude: -23.561684, longitude: -46.655981}; // Paulista
    const endCoords = bestStop
      ? {
          latitude: bestStop.latitude + 0.05,
          longitude: bestStop.longitude + 0.05,
        }
      : {latitude: -23.6, longitude: -46.7};

    const routeCoordinates = [
      startCoords,
      bestStop
        ? {latitude: bestStop.latitude, longitude: bestStop.longitude}
        : {latitude: -23.58, longitude: -46.68},
      endCoords,
    ];

    return (
      <Layout style={styles.container}>
        <TopNavigation
          title="Planejador de Rota"
          alignment="center"
          leftControl={this.renderBackAction()}
        />
        <Divider />

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.inputCard}>
            <Text category="h6" style={{marginBottom: 10}}>
              Para onde vamos?
            </Text>
            <Input
              label="Destino"
              placeholder="Ex: Praia Grande, SP"
              value={destination}
              onChangeText={t => this.setState({destination: t})}
              style={styles.input}
              accessoryLeft={props => <Icon {...props} name="pin-outline" />}
            />
            <Input
              label="Distância Estimada (km)"
              placeholder="Ex: 80"
              value={distance}
              onChangeText={t => this.setState({distance: t})}
              keyboardType="numeric"
              style={styles.input}
              accessoryLeft={props => (
                <Icon {...props} name="navigation-2-outline" />
              )}
            />
            <Button
              onPress={this.handleCalculate}
              disabled={isCalculating}
              accessoryLeft={props =>
                isCalculating ? (
                  <Icon {...props} name="loader-outline" />
                ) : (
                  <Icon {...props} name="search-outline" />
                )
              }>
              {isCalculating ? 'Calculando Rota...' : 'Encontrar Melhor Posto'}
            </Button>
          </Card>

          {routeFound && (
            <>
              <View style={styles.mapContainer}>
                {MapView ? (
                  <MapView
                    ref={ref => {
                      if (Platform.OS !== 'web') {
                        this.mapRef = ref;
                      }
                    }}
                    style={styles.map}
                    initialRegion={{
                      latitude: startCoords.latitude,
                      longitude: startCoords.longitude,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }}>
                    {Marker && (
                      <Marker
                        coordinate={startCoords}
                        title="Início"
                        pinColor="blue"
                      />
                    )}
                    {Marker && (
                      <Marker
                        coordinate={endCoords}
                        title="Destino"
                        pinColor="green"
                      />
                    )}
                    {bestStop && Marker && (
                      <Marker
                        coordinate={{
                          latitude: bestStop.latitude,
                          longitude: bestStop.longitude,
                        }}
                        title={`Parada: ${bestStop.name}`}
                        pinColor="gold"
                        description={`Gas: ${bestStop.priceGas} | Etanol: ${
                          bestStop.priceEthanol
                        }`}
                      />
                    )}
                    {Polyline && (
                      <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#3366FF"
                        strokeWidth={4}
                      />
                    )}
                  </MapView>
                ) : (
                  <Text>Mapa indisponível</Text>
                )}
                <View style={styles.mapOverlay}>
                  <Text
                    category="c2"
                    style={{color: 'white', fontWeight: 'bold'}}>
                    Rota Otimizada
                  </Text>
                </View>
              </View>

              {bestStop && (
                <Card
                  style={[
                    styles.resultCard,
                    {borderColor: '#00E096', borderWidth: 2},
                  ]}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}>
                    <Icon
                      name="gift-outline"
                      width={24}
                      height={24}
                      fill="#00E096"
                    />
                    <Text category="h6" style={{marginLeft: 10}}>
                      Economia Encontrada!
                    </Text>
                  </View>
                  <Text category="s1">Pare no {bestStop.name}</Text>
                  <Text category="p2" appearance="hint">
                    {bestStop.address}
                  </Text>

                  <View style={styles.savingsBadge}>
                    <Text
                      category="h5"
                      style={{color: 'white', fontWeight: 'bold'}}>
                      Economize R$ {savings.toFixed(2)}
                    </Text>
                  </View>

                  <Button
                    status="success"
                    style={{marginTop: 15}}
                    accessoryLeft={props => (
                      <Icon {...props} name="navigation-outline" />
                    )}
                    onPress={() => alert('Abrindo Google Maps...')}>
                    Iniciar Navegação
                  </Button>
                </Card>
              )}
            </>
          )}
        </ScrollView>
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 15,
    paddingBottom: 50,
  },
  inputCard: {
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
  },
  input: {
    marginBottom: 15,
  },
  mapContainer: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 4,
    backgroundColor: '#eee',
  },
  map: {
    flex: 1,
  },
  resultCard: {
    borderRadius: 12,
    elevation: 4,
  },
  savingsBadge: {
    backgroundColor: '#00E096',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  mapOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(51, 102, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
});
