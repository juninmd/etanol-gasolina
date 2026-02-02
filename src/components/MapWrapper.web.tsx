import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, List, Button, Icon } from '@ui-kitten/components';

const MapView = (props: any) => {
  // Mock station data for web demo
  const mockStations = [
    {
      id: 1,
      name: 'Posto Shell Centro',
      gasoline: 5.89,
      ethanol: 4.12,
      distance: '0.5 km'
    },
    {
      id: 2,
      name: 'Ipiranga Express',
      gasoline: 5.95,
      ethanol: 4.18,
      distance: '1.2 km'
    },
    {
      id: 3,
      name: 'BR Distribuidora',
      gasoline: 5.79,
      ethanol: 4.05,
      distance: '1.8 km'
    }
  ];

  const renderStation = ({ item }: any) => (
    <Card style={styles.stationCard}>
      <View style={styles.stationHeader}>
        <Icon name="location-outline" style={styles.locationIcon} fill="#667eea" />
        <Text style={styles.stationName}>{item.name}</Text>
        <Text style={styles.distance}>{item.distance}</Text>
      </View>
      <View style={styles.pricesRow}>
        <View style={styles.priceItem}>
          <Text style={styles.fuelLabel}>Gasolina</Text>
          <Text style={styles.price}>R$ {item.gasoline.toFixed(2)}</Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={styles.fuelLabel}>Etanol</Text>
          <Text style={styles.price}>R$ {item.ethanol.toFixed(2)}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Icon name="map-outline" style={styles.mapIcon} fill="#667eea" />
        <Text style={styles.mapText}>
          Mapa interativo (disponível no app mobile)
        </Text>
        <Text style={styles.webNote}>
          Versão web mostra lista de postos próximos
        </Text>
      </View>

      <View style={styles.stationsList}>
        <Text style={styles.listTitle}>Postos Próximos</Text>
        <List
          data={mockStations}
          renderItem={renderStation}
          style={styles.list}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#e8ecf4',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    borderRadius: 8,
  },
  mapIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  mapText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  webNote: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
  },
  stationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  list: {
    backgroundColor: 'transparent',
  },
  stationCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  pricesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priceItem: {
    alignItems: 'center',
  },
  fuelLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
});

export const Marker = (props: any) => null;

export default MapView;
