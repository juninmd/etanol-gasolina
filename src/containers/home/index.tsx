import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Layout,
  Text,
  Icon,
  Button,
  Card,
  Input,
  Modal,
  Toggle,
} from '@ui-kitten/components';
import {observer} from 'mobx-react';
import {useNavigation} from '@react-navigation/native';
import {reaction} from 'mobx';

let Svg: any, Circle: any, Defs: any, LinearGradient: any, Stop: any;
if (Platform.OS !== 'web') {
  try {
    const RNSvg = require('react-native-svg');
    Svg = RNSvg.default;
    Circle = RNSvg.Circle;
    Defs = RNSvg.Defs;
    LinearGradient = RNSvg.LinearGradient;
    Stop = RNSvg.Stop;
  } catch (e) {
    console.error('Failed to load react-native-svg', e);
  }
}

// Import Stores
import {homeStore} from '../../stores/home.store';
import {stationsStore} from '../../stores/stations.store';
import {garageStore} from '../../stores/garage.store';
import {themeStore} from '../../stores/theme.store';

// Components
import SmartFuelCard from '../../components/SmartFuelCard';
import MapView, {Marker} from '../../components/MapWrapper';
import FuelMatchModal from '../../components/FuelMatchModal';
import FuelWrappedModal from '../../components/FuelWrappedModal';
import AICopilotModal from '../../components/AICopilotModal';
import TimeMachineModal from '../../components/TimeMachineModal';
import Caragotchi from '../../components/Caragotchi';
import ARPriceScannerModal from '../../components/ARPriceScannerModal';
import ChurrascometroModal from '../../components/ChurrascometroModal';
import RideVsCarModal from '../../components/RideVsCarModal';
import RoletaDaSorteModal from '../../components/RoletaDaSorteModal';
import BatalhaDePostosModal from '../../components/BatalhaDePostosModal';
import MeSurpreendaModal from '../../components/MeSurpreendaModal';

const {width} = Dimensions.get('window');
const CIRCLE_SIZE = 180;
const STROKE_WIDTH = 15;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Magic Prediction Widget
const PricePredictionWidget = observer(({stationsStore}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [prediction, setPrediction] = useState<{
    message: string;
    icon: string;
    color: string;
  } | null>(null);

  const generatePrediction = () => {
    setIsScanning(true);
    setPrediction(null);

    // Simulate AI scanning
    setTimeout(() => {
      const upCount = stationsStore.stations.filter(
        (s) => s.priceTrend === 'up',
      ).length;
      const downCount = stationsStore.stations.filter(
        (s) => s.priceTrend === 'down',
      ).length;

      let result;
      if (downCount > upCount && downCount > 0) {
        result = {
          message:
            'Tendência de Queda! Segure o abastecimento para economizar mais amanhã.',
          icon: 'trending-down-outline',
          color: '#00E096',
        };
      } else if (upCount > downCount && upCount > 0) {
        result = {
          message: 'Alerta de Alta! Abasteça hoje antes que os preços subam.',
          icon: 'trending-up-outline',
          color: '#FF3D71',
        };
      } else {
        result = {
          message:
            'Mercado estável. Bom momento para pesquisar promoções locais.',
          icon: 'activity-outline',
          color: '#3366FF',
        };
      }

      setPrediction(result);
      setIsScanning(false);
    }, 1500);
  };

  return (
    <Card
      style={[
        styles.card,
        {marginTop: 20, borderColor: '#9C27B0', overflow: 'hidden'},
      ]}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon name="radio-outline" width={24} height={24} fill="#9C27B0" />
          <Text category="h6" style={{marginLeft: 10, color: '#9C27B0'}}>
            Radar IA de Preços
          </Text>
        </View>
        <Button
          size="tiny"
          appearance="ghost"
          status="primary"
          onPress={generatePrediction}
          disabled={isScanning}>
          {isScanning ? 'Analisando...' : 'Prever'}
        </Button>
      </View>

      {isScanning && (
        <View style={{marginTop: 15, alignItems: 'center'}}>
          <Icon
            name="loader-outline"
            width={32}
            height={32}
            fill="#9C27B0"
            animation="spin"
          />
          <Text category="c1" appearance="hint" style={{marginTop: 5}}>
            Processando tendências do mercado...
          </Text>
        </View>
      )}

      {prediction && !isScanning && (
        <View
          style={{
            marginTop: 15,
            backgroundColor: `${prediction.color}15`,
            padding: 15,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor: prediction.color,
              padding: 8,
              borderRadius: 20,
              marginRight: 15,
            }}>
            <Icon name={prediction.icon} width={24} height={24} fill="white" />
          </View>
          <Text
            category="s2"
            style={{flex: 1, color: prediction.color, fontWeight: 'bold'}}>
            {prediction.message}
          </Text>
        </View>
      )}

      {!prediction && !isScanning && (
        <Text category="c1" appearance="hint" style={{marginTop: 10}}>
          Toque em "Prever" para analisar o mercado e descobrir a melhor hora
          para abastecer.
        </Text>
      )}
    </Card>
  );
});

// Dream Goals Card
const DreamGoals = observer(({stationsStore}) => {
  const {totalSavings} = stationsStore;

  // Define some goals
  const goals = [
    {name: 'Tanque Cheio', cost: 250, icon: 'car-outline', color: '#3366FF'},
    {
      name: 'Troca de Óleo',
      cost: 150,
      icon: 'droplet-outline',
      color: '#00E096',
    },
    {
      name: 'Pneu Novo',
      cost: 400,
      icon: 'radio-button-off-outline',
      color: '#FF3D71',
    },
  ];

  // Find the next achievable goal
  const nextGoal =
    goals.find((g) => totalSavings < g.cost) || goals[goals.length - 1];
  const progress = Math.min(1, totalSavings / nextGoal.cost);

  return (
    <Card style={[styles.card, {marginTop: 20, borderColor: nextGoal.color}]}>
      <View
        style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
        <View
          style={{
            backgroundColor: `${nextGoal.color}15`,
            padding: 8,
            borderRadius: 20,
          }}>
          <Icon
            name={nextGoal.icon}
            width={24}
            height={24}
            fill={nextGoal.color}
          />
        </View>
        <Text
          category="h6"
          style={{marginLeft: 10, color: nextGoal.color, fontWeight: 'bold'}}>
          Meta dos Sonhos
        </Text>
      </View>
      <Text category="s2" appearance="hint" style={{marginBottom: 10}}>
        Sua economia está rendendo! Faltam apenas R${' '}
        {Math.max(0, nextGoal.cost - totalSavings).toFixed(2)} para:
      </Text>
      <Text category="h5" style={{textAlign: 'center', marginBottom: 10}}>
        {nextGoal.name} (R$ {nextGoal.cost})
      </Text>
      <View
        style={{
          height: 12,
          backgroundColor: '#EDF1F7',
          borderRadius: 6,
          overflow: 'hidden',
        }}>
        <View
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            backgroundColor: nextGoal.color,
          }}
        />
      </View>
      <Text
        category="c1"
        appearance="hint"
        style={{textAlign: 'right', marginTop: 5}}>
        {(progress * 100).toFixed(1)}% concluído
      </Text>
    </Card>
  );
});

// Eco Impact Card
const EcoImpactCard = observer(({stationsStore}) => {
  const {totalCO2Saved, treesPlanted} = stationsStore;

  if (totalCO2Saved <= 0) {
    return null;
  }

  return (
    <Card style={[styles.card, {marginTop: 20, borderColor: '#00E096'}]}>
      <View
        style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
        <View
          style={{backgroundColor: '#E5F9F1', padding: 8, borderRadius: 20}}>
          <Icon name="globe-2-outline" width={24} height={24} fill="#00E096" />
        </View>
        <Text
          category="h6"
          style={{marginLeft: 10, color: '#00E096', fontWeight: 'bold'}}>
          Impacto Ambiental
        </Text>
      </View>
      <Text category="s2" appearance="hint" style={{marginBottom: 15}}>
        Ao escolher Etanol, você reduz a emissão de gases poluentes e ajuda o
        planeta!
      </Text>

      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{alignItems: 'center', flex: 1}}>
          <Text category="h4" status="success">
            {totalCO2Saved.toFixed(1)}kg
          </Text>
          <Text category="c1" appearance="hint">
            CO2 Evitado
          </Text>
        </View>
        <View
          style={{width: 1, backgroundColor: '#EDF1F7', marginHorizontal: 10}}
        />
        <View style={{alignItems: 'center', flex: 1}}>
          <Text category="h4" status="success">
            {treesPlanted} 🌳
          </Text>
          <Text category="c1" appearance="hint">
            Árvores Salvas
          </Text>
        </View>
      </View>
    </Card>
  );
});

// Daily Challenge Card
const DailyChallengeCard = observer(({stationsStore}) => {
  const {dailyChallenge} = stationsStore;
  const progress = Math.min(1, dailyChallenge.progress / dailyChallenge.target);

  return (
    <Card style={[styles.card, {marginTop: 20, borderColor: '#FFAAA5'}]}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon name="award-outline" width={24} height={24} fill="#FFAAA5" />
          <Text category="h6" style={{marginLeft: 10}}>
            Desafio Diário
          </Text>
        </View>
        <View style={{backgroundColor: '#FFF5F5', padding: 5, borderRadius: 5}}>
          <Text category="c2" status="warning" style={{fontWeight: 'bold'}}>
            +{dailyChallenge.reward} PTS
          </Text>
        </View>
      </View>
      <Text category="s1" style={{marginTop: 10}}>
        {dailyChallenge.task}
      </Text>
      <View style={{marginTop: 15}}>
        <View style={{height: 10, backgroundColor: '#EDF1F7', borderRadius: 5}}>
          <View
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              backgroundColor: '#FFAAA5',
              borderRadius: 5,
            }}
          />
        </View>
        <Text
          category="c1"
          appearance="hint"
          style={{marginTop: 5, textAlign: 'right'}}>
          {dailyChallenge.progress} / {dailyChallenge.target}
        </Text>
      </View>
      {dailyChallenge.completed && (
        <Button
          size="small"
          status="success"
          style={{marginTop: 10}}
          disabled={true}
          accessoryLeft={(props) => (
            <Icon {...props} name="checkmark-outline" />
          )}>
          COMPLETADO
        </Button>
      )}
    </Card>
  );
});

// Circular Progress Component
const NearbyMapWidget = observer(({stationsStore, navigation}) => {
  const {stations} = stationsStore;
  // Pick the closest station (mock: first one)
  const bestStation = stations[0];

  if (!bestStation) {
    return null;
  }

  return (
    <Card
      style={[styles.card, {marginTop: 10}]}
      onPress={() =>
        navigation.navigate('StationDetails', {stationId: bestStation.id})
      }>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}>
        <Text category="h6">Perto de Você</Text>
        <Icon
          name="arrow-forward-outline"
          width={20}
          height={20}
          fill="#8F9BB3"
        />
      </View>
      <View style={{height: 150, borderRadius: 12, overflow: 'hidden'}}>
        <MapView
          style={{flex: 1}}
          initialRegion={{
            latitude: bestStation.latitude,
            longitude: bestStation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}>
          <Marker
            coordinate={{
              latitude: bestStation.latitude,
              longitude: bestStation.longitude,
            }}
            title={bestStation.name}
          />
        </MapView>
        <View style={styles.mapOverlay}>
          <Text category="c2" style={{color: 'white', fontWeight: 'bold'}}>
            {bestStation.name}
          </Text>
          <Text category="c2" style={{color: '#00E096', fontWeight: 'bold'}}>
            R$ {bestStation.priceGas.toFixed(2)}
          </Text>
        </View>
      </View>
    </Card>
  );
});

const SavingsProgress = ({total, target = 2000}) => {
  const progress = Math.min(total / target, 1);
  const strokeDashoffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  if (Platform.OS === 'web' || !Svg) {
    return (
      <View style={styles.heroContainer}>
        <View
          style={{
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            borderRadius: CIRCLE_SIZE / 2,
            borderWidth: STROKE_WIDTH,
            borderColor: '#3366FF',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View style={styles.heroTextContainer}>
            <Text category="s2" appearance="hint">
              Economia Total
            </Text>
            <Text category="h4" style={styles.heroValue}>
              R$ {total.toFixed(2)}
            </Text>
            <Text category="c1" status="success">
              Top 5% Savers
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.heroContainer}>
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#3366FF" stopOpacity="1" />
            <Stop offset="1" stopColor="#00E096" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        {/* Background Circle */}
        <Circle
          stroke="rgba(255, 255, 255, 0.1)"
          fill="none"
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
        />
        {/* Progress Circle */}
        <Circle
          stroke="url(#grad)"
          fill="none"
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
        />
      </Svg>
      <View style={styles.heroTextContainer}>
        <Text category="s2" appearance="hint">
          Economia Total
        </Text>
        <Text category="h4" style={styles.heroValue}>
          R$ {total.toFixed(2)}
        </Text>
        <Text category="c1" status="success">
          Top 5% Savers
        </Text>
      </View>
    </View>
  );
};

const Home = observer(() => {
  const navigation = useNavigation();
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceState, setVoiceState] = useState<
    'listening' | 'processing' | 'result'
  >('listening');
  const [voiceResult, setVoiceResult] = useState('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [showFuelMatch, setShowFuelMatch] = useState(false);
  const [showFuelWrapped, setShowFuelWrapped] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showTimeMachine, setShowTimeMachine] = useState(false);
  const [showARScanner, setShowARScanner] = useState(false);
  const [showChurrasco, setShowChurrasco] = useState(false);
  const [showRideVsCar, setShowRideVsCar] = useState(false);
  const [showRoleta, setShowRoleta] = useState(false);
  const [showBatalha, setShowBatalha] = useState(false);
  const [showSurpreenda, setShowSurpreenda] = useState(false);

  // Reactions & Effects
  useEffect(() => {
    const dispose = reaction(
      () => {
        const {favorites, stations} = stationsStore;
        return stations
          .filter((s) => favorites.includes(s.id) && s.isPromo)
          .map((s) => s.id)
          .join(',');
      },
      (_promoIds) => {
        checkPromos();
      },
    );
    checkPromos();
    return () => dispose();
  }, []);

  const checkPromos = () => {
    const {favorites, stations} = stationsStore;
    if (favorites.length > 0) {
      const promoStations = stations.filter(
        (s) => favorites.includes(s.id) && s.isPromo,
      );
      if (promoStations.length > 0) {
        const stationNames = promoStations.map((s) => s.name).join(', ');
        setPromoMessage(`Promoção nos favoritos: ${stationNames}!`);
      } else {
        setPromoMessage(null);
      }
    }
  };

  const handleVoicePress = () => {
    setShowVoiceModal(true);
    setVoiceState('listening');
    setVoiceResult('');

    // Mock interaction
    setTimeout(() => {
      setVoiceState('processing');
      setTimeout(() => {
        const {bestStation} = stationsStore;
        setVoiceResult(
          `Encontrei! O ${bestStation && bestStation.name} é a melhor opção.`,
        );
        setVoiceState('result');
      }, 1500);
    }, 2000);
  };

  const handleSurpriseMe = () => {
    setShowSurpreenda(true);
  };

  const handleFuelMatch = (stationId: number) => {
    // Add some gamification points for finding a match
    stationsStore.addPoints(10);
    navigation.navigate('StationDetails', {stationId});
  };

  const renderActivityItem = (item) => {
    let iconName = 'activity-outline';
    let iconColor = '#8F9BB3';

    if (item.type === 'savings') {
      iconName = 'trending-up-outline';
      iconColor = '#00E096';
    }
    if (item.type === 'price_update') {
      iconName = 'pricetags-outline';
      iconColor = '#3366FF';
    }
    if (item.type === 'verification') {
      iconName = 'checkmark-circle-2-outline';
      iconColor = '#FFAAA5';
    }
    if (item.type === 'comment') {
      iconName = 'message-circle-outline';
      iconColor = '#FFD700';
    }

    const timeAgo = Math.floor((Date.now() - item.timestamp) / 60000);
    let timeText = `${timeAgo} min`;
    if (timeAgo > 60) {
      timeText = `${Math.floor(timeAgo / 60)}h`;
    }

    return (
      <View key={item.id} style={styles.activityItem}>
        <View
          style={[styles.iconContainer, {backgroundColor: iconColor + '20'}]}>
          <Icon name={iconName} width={20} height={20} fill={iconColor} />
        </View>
        <View style={{flex: 1, marginLeft: 10}}>
          <Text category="s2" style={{fontSize: 13}}>
            <Text style={{fontWeight: 'bold'}}>{item.author}</Text> {item.text}
          </Text>
          <Text category="c2" appearance="hint">
            {timeText} atrás
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Layout style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text category="h5" style={{fontWeight: 'bold'}}>
            Level {stationsStore.level} Saver
          </Text>
          <Text category="c1" appearance="hint">
            Diamond Tier Elite
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={themeStore.toggleTheme}
            style={styles.iconButton}>
            <Text style={{fontSize: 18}}>
              {themeStore.theme === 'dark' ? '🌙' : '☀️'}
            </Text>
          </TouchableOpacity>
          <Button
            appearance="ghost"
            status="basic"
            accessoryLeft={(props) => (
              <Icon {...props} name="settings-2-outline" />
            )}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <SavingsProgress total={stationsStore.totalSavings} />

        <PricePredictionWidget stationsStore={stationsStore} />

        <DreamGoals stationsStore={stationsStore} />

        <EcoImpactCard stationsStore={stationsStore} />

        <Caragotchi stationsStore={stationsStore} />

        <DailyChallengeCard stationsStore={stationsStore} />

        {promoMessage && (
          <View style={styles.promoBanner}>
            <Icon
              name="alert-circle-outline"
              width={24}
              height={24}
              fill="#fff"
            />
            <Text style={styles.promoText}>{promoMessage}</Text>
          </View>
        )}

        <Button
          style={{marginBottom: 20, borderRadius: 30}}
          status="warning"
          accessoryLeft={p => <Icon {...p} name="gift-outline" />}
          onPress={() => setShowSurpreenda(true)}>
          ME SURPREENDA!
        </Button>

        {/* Smart Choice */}
        <Text category="h6" style={styles.sectionTitle}>
          Smart Fuel Choice
        </Text>
        <SmartFuelCard stationsStore={stationsStore} />

        {/* Nearby Map Widget */}
        <NearbyMapWidget
          stationsStore={stationsStore}
          navigation={navigation}
        />

        {/* Market Trends & Actions Row */}
        <View style={styles.row}>
          <Card
            style={[styles.card, styles.halfCard]}
            onPress={() => navigation.navigate('MarketInsights')}>
            <View>
              <Text category="s2" appearance="hint">
                Market Advice
              </Text>
              <Text category="h6" status="primary" style={{marginTop: 5}}>
                {stationsStore.globalMarketAdvice}
              </Text>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Icon
                  name="trending-down-outline"
                  width={16}
                  height={16}
                  fill="#00E096"
                />
                <Text category="c2" status="success" style={{marginLeft: 5}}>
                  Buy Now
                </Text>
              </View>
            </View>
          </Card>

          <Card
            style={[styles.card, styles.halfCard]}
            onPress={() => navigation.navigate('TripPlanner')}>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}>
              <Icon name="map-outline" width={32} height={32} fill="#3366FF" />
              <Text category="s2" style={{marginTop: 10}}>
                Trip Planner
              </Text>
            </View>
          </Card>
        </View>

        {/* Gamification / Badges */}
        <Text category="h6" style={styles.sectionTitle}>
          Badges Unlocked
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.badgeScroll}>
          {stationsStore.badges.map((badge) => (
            <View
              key={badge.id}
              style={[
                styles.badgeContainer,
                {opacity: badge.unlocked ? 1 : 0.5},
              ]}>
              <View
                style={[
                  styles.badgeCircle,
                  {borderColor: badge.unlocked ? '#FFD700' : '#8F9BB3'},
                ]}>
                <Icon
                  name={badge.icon}
                  width={30}
                  height={30}
                  fill={badge.unlocked ? '#FFD700' : '#8F9BB3'}
                />
              </View>
              <Text
                category="c2"
                style={{marginTop: 5, textAlign: 'center'}}
                numberOfLines={1}>
                {badge.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Community Feed */}
        {stationsStore.recentActivities.length > 0 && (
          <View style={styles.feedContainer}>
            <Text category="h6" style={styles.sectionTitle}>
              Community Live
            </Text>
            <Card style={styles.card}>
              {stationsStore.recentActivities
                .slice(0, 3)
                .map(renderActivityItem)}
            </Card>
          </View>
        )}

        {/* Data Input Section (Collapsed/Simplified) */}
        <Card style={[styles.card, {marginTop: 10}]}>
          <Text category="s1" style={{marginBottom: 10}}>
            Quick Input
          </Text>
          <View style={styles.inputRow}>
            <Input
              placeholder="Etanol"
              value={homeStore.etanol}
              onChangeText={(t) => homeStore.handleForm({etanol: t})}
              keyboardType="numeric"
              style={{flex: 1, marginRight: 5}}
            />
            <Input
              placeholder="Gasolina"
              value={homeStore.gasolina}
              onChangeText={(t) => homeStore.handleForm({gasolina: t})}
              keyboardType="numeric"
              style={{flex: 1, marginLeft: 5}}
            />
          </View>
          <View style={{marginTop: 10}}>
            {homeStore.recommendation === 'bicycle' ? (
              <View style={{alignItems: 'center'}}>
                <Icon
                  name="bicycle-outline"
                  width={48}
                  height={48}
                  fill="#00E096"
                  style={{marginBottom: 5}}
                />
                <Text
                  status="success"
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: 16,
                  }}>
                  {homeStore.resultado}
                </Text>
              </View>
            ) : homeStore.resultado ? (
              <Text
                status={
                  homeStore.recommendation === 'ethanol' ? 'success' : 'info'
                }
                style={{textAlign: 'center', fontWeight: 'bold'}}>
                {homeStore.resultado}
              </Text>
            ) : (
              <Text appearance="hint" style={{textAlign: 'center'}}>
                Enter prices to compare
              </Text>
            )}
          </View>
        </Card>
      </ScrollView>

      {/* Fuel Match Modal */}
      <FuelMatchModal
        visible={showFuelMatch}
        onClose={() => setShowFuelMatch(false)}
        stations={stationsStore.stations.slice()} // Pass a shallow copy
        onMatch={handleFuelMatch}
      />

      {/* Voice Assistant Modal */}
      <Modal
        visible={showVoiceModal}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setShowVoiceModal(false)}>
        <Card disabled={true} style={styles.modalCard}>
          <View style={{alignItems: 'center', padding: 20}}>
            {voiceState === 'listening' && (
              <>
                <Icon
                  name="mic"
                  width={60}
                  height={60}
                  fill="#3366FF"
                  style={{marginBottom: 20}}
                />
                <Text category="h6">Ouvindo...</Text>
              </>
            )}
            {voiceState === 'processing' && (
              <>
                <Icon
                  name="more-horizontal-outline"
                  width={60}
                  height={60}
                  fill="#3366FF"
                  style={{marginBottom: 20}}
                />
                <Text category="h6">Analisando preços...</Text>
              </>
            )}
            {voiceState === 'result' && (
              <>
                <Icon
                  name="checkmark-circle-2-outline"
                  width={60}
                  height={60}
                  fill="#00E096"
                  style={{marginBottom: 20}}
                />
                <Text
                  category="s1"
                  style={{marginBottom: 20, textAlign: 'center'}}>
                  {voiceResult}
                </Text>
                <Button
                  style={{marginBottom: 10, width: '100%'}}
                  onPress={() => {
                    setShowVoiceModal(false);
                    const {bestStation} = stationsStore;
                    if (bestStation) {
                      navigation.navigate('StationDetails', {
                        stationId: bestStation.id,
                      });
                    }
                  }}>
                  Ir para o Posto
                </Button>
                <Button
                  appearance="ghost"
                  onPress={() => setShowVoiceModal(false)}>
                  Fechar
                </Button>
              </>
            )}
          </View>
        </Card>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.surpriseFab} onPress={handleSurpriseMe}>
        <Icon name="gift-outline" width={32} height={32} fill="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.voiceFab} onPress={handleVoicePress}>
        <Icon name="mic-outline" width={32} height={32} fill="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.wrappedFab}
        onPress={() => setShowFuelWrapped(true)}>
        <Icon name="star-outline" width={32} height={32} fill="white" />
      </TouchableOpacity>

      <FuelWrappedModal
        visible={showFuelWrapped}
        onClose={() => setShowFuelWrapped(false)}
        stationsStore={stationsStore}
      />

      <AICopilotModal
        visible={showCopilot}
        onClose={() => setShowCopilot(false)}
        stationsStore={stationsStore}
      />

      <TimeMachineModal
        visible={showTimeMachine}
        onClose={() => setShowTimeMachine(false)}
      />

      <ARPriceScannerModal
        visible={showARScanner}
        onClose={() => setShowARScanner(false)}
        stationsStore={stationsStore}
      />

      <ChurrascometroModal
        visible={showChurrasco}
        onClose={() => setShowChurrasco(false)}
        stationsStore={stationsStore}
      />

      <RideVsCarModal
        visible={showRideVsCar}
        onClose={() => setShowRideVsCar(false)}
        stationsStore={stationsStore}
        garageStore={garageStore}
      />

      <RoletaDaSorteModal
        visible={showRoleta}
        onClose={() => setShowRoleta(false)}
        stationsStore={stationsStore}
      />

      <MeSurpreendaModal
        visible={showSurpreenda}
        onClose={() => setShowSurpreenda(false)}
        stationsStore={stationsStore}
      />

      <BatalhaDePostosModal
        visible={showBatalha}
        onClose={() => setShowBatalha(false)}
        stationsStore={stationsStore}
      />

      {/* New FABs */}
      <TouchableOpacity
        style={[styles.wrappedFab, {bottom: 580, backgroundColor: '#00D084'}]}
        onPress={() => setShowBatalha(true)}>
        <Icon name="flash-outline" width={32} height={32} fill="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.wrappedFab, {bottom: 510, backgroundColor: '#3366FF'}]}
        onPress={() => setShowRideVsCar(true)}>
        <Icon name="navigation-2-outline" width={32} height={32} fill="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.wrappedFab, {bottom: 230, backgroundColor: '#00E096'}]}
        onPress={() => setShowCopilot(true)}>
        <Icon
          name="message-circle-outline"
          width={32}
          height={32}
          fill="white"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.wrappedFab, {bottom: 300, backgroundColor: '#9C27B0'}]}
        onPress={() => setShowTimeMachine(true)}>
        <Icon name="clock-outline" width={32} height={32} fill="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.wrappedFab, {bottom: 370, backgroundColor: '#FF8C00'}]}
        onPress={() => setShowARScanner(true)}>
        <Icon name="camera-outline" width={32} height={32} fill="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.wrappedFab, {bottom: 440, backgroundColor: '#FF3D71'}]}
        onPress={() => setShowChurrasco(true)}>
        <Icon name="sun-outline" width={32} height={32} fill="white" />
      </TouchableOpacity>
    </Layout>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  heroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  heroTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  heroValue: {
    fontWeight: 'bold',
    marginVertical: 5,
  },
  sectionTitle: {
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 20,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Glass effect hint
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: 10,
  },
  halfCard: {
    flex: 1,
    marginHorizontal: 5,
    height: 120,
  },
  badgeScroll: {
    paddingLeft: 20,
    marginBottom: 10,
  },
  badgeContainer: {
    alignItems: 'center',
    marginRight: 15,
    width: 70,
  },
  badgeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  feedContainer: {
    marginTop: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBanner: {
    backgroundColor: '#FFA500',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    padding: 20,
    width: 300,
    borderRadius: 16,
  },
  input: {
    marginVertical: 10,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
  },
  voiceFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3366FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  surpriseFab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3D71',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  wrappedFab: {
    position: 'absolute',
    bottom: 160,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default Home;
