import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  Card,
  Text,
  Icon,
  Button,
  Layout,
  useTheme,
} from '@ui-kitten/components';
import {observer} from 'mobx-react';
import StationsStore from '../stores/stations.store';

interface Props {
  stationsStore: StationsStore;
}

const SmartFuelCard = observer(({stationsStore}: Props) => {
  const theme = useTheme();
  const {marketAnalysis} = stationsStore;
  const {avgGas, avgEthanol, ratio, bestFuel, potentialSavingsPct} =
    marketAnalysis;

  // Handle empty state
  if (ratio === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              {backgroundColor: theme['color-basic-200']},
            ]}>
            <Icon
              name="activity-outline"
              width={24}
              height={24}
              fill={theme['text-hint-color']}
            />
          </View>
          <View style={styles.headerText}>
            <Text category="h6">Analisando Mercado...</Text>
            <Text category="c1" appearance="hint">
              Aguarde enquanto buscamos dados
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  // Determine status color
  const isEthanol = bestFuel === 'Ethanol';
  const status = isEthanol ? 'success' : 'info'; // Success (Green) for Ethanol, Info (Blue) for Gas
  const fillColor = isEthanol
    ? theme['color-success-500']
    : theme['color-info-500'];

  // Calculate indicator position for the bar (clamped for visual safety)
  // Scale: 0.5 to 0.9.
  // 0.7 is the center.
  // Let's map ratio to percentage:
  // 0.5 -> 0%
  // 0.9 -> 100%
  const minRatio = 0.5;
  const maxRatio = 0.9;
  const clampedRatio = Math.max(minRatio, Math.min(maxRatio, ratio));
  const positionPct = ((clampedRatio - minRatio) / (maxRatio - minRatio)) * 100;

  const pivotPos = ((0.7 - minRatio) / (maxRatio - minRatio)) * 100;

  return (
    <Card status={status} style={styles.card}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isEthanol
                ? theme['color-success-100']
                : theme['color-info-100'],
            },
          ]}>
          <Icon
            name={isEthanol ? 'trending-down-outline' : 'trending-up-outline'}
            width={24}
            height={24}
            fill={fillColor}
          />
        </View>
        <View style={styles.headerText}>
          <Text category="h6">Smart Choice</Text>
          <Text category="c1" appearance="hint">
            Análise de mercado em tempo real
          </Text>
        </View>
      </View>

      <View style={styles.mainContent}>
        <Text category="h4" style={{color: fillColor, fontWeight: 'bold'}}>
          Abasteça com {bestFuel.toUpperCase()}
        </Text>
        {potentialSavingsPct > 0 && (
          <Text category="s1" style={{marginTop: 5}}>
            Economia estimada de{' '}
            <Text style={{fontWeight: 'bold', color: fillColor}}>
              {potentialSavingsPct}%
            </Text>
          </Text>
        )}
      </View>

      {/* Visual Gauge */}
      <View style={styles.gaugeContainer}>
        <Text category="c2">Etanol</Text>
        <View style={styles.barContainer}>
          {/* Background gradient simulation */}
          <View
            style={[
              styles.zone,
              {
                width: `${pivotPos}%`,
                backgroundColor: theme['color-success-200'],
              },
            ]}
          />
          <View
            style={[
              styles.zone,
              {
                width: `${100 - pivotPos}%`,
                backgroundColor: theme['color-info-200'],
              },
            ]}
          />

          {/* Pivot Line (0.7) */}
          <View style={[styles.pivotLine, {left: `${pivotPos}%`}]} />

          {/* Current Position Marker */}
          <View
            style={[
              styles.marker,
              {
                left: `${positionPct}%`,
                backgroundColor: theme['text-basic-color'],
              },
            ]}>
            <View style={styles.markerKnob} />
          </View>
        </View>
        <Text category="c2">Gasolina</Text>
      </View>

      <Text category="c1" style={{textAlign: 'center', marginTop: 5}}>
        Razão Atual: {ratio.toFixed(2)} (Ideal {'<'} 0.70)
      </Text>

      <View style={styles.footer}>
        <View style={styles.priceTag}>
          <Text category="c2" appearance="hint">
            Média Etanol
          </Text>
          <Text category="s2">R$ {avgEthanol.toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.priceTag}>
          <Text category="c2" appearance="hint">
            Média Gasolina
          </Text>
          <Text category="s2">R$ {avgGas.toFixed(2)}</Text>
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  mainContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gaugeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  barContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#F7F9FC',
    borderRadius: 6,
    marginHorizontal: 10,
    position: 'relative',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  zone: {
    height: '100%',
  },
  pivotLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 1,
  },
  marker: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 4,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -2, // Center align
  },
  markerKnob: {
    width: 10,
    height: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F7F9FC',
  },
  priceTag: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  divider: {
    width: 1,
    backgroundColor: '#E4E9F2',
  },
});

export default SmartFuelCard;
