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
import Svg, {
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
  Polyline,
} from 'react-native-svg';
import {reaction} from 'mobx';

// Import Stores
import {homeStore} from '../../stores/home.store';
import {stationsStore} from '../../stores/stations.store';
import {garageStore} from '../../stores/garage.store';
import {themeStore} from '../../stores/theme.store';

// Components
import SmartFuelCard from '../../components/SmartFuelCard';

const {width} = Dimensions.get('window');
const CIRCLE_SIZE = 180;
const STROKE_WIDTH = 15;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Circular Progress Component
const SavingsProgress = ({total, target = 2000}) => {
  const progress = Math.min(total / target, 1);
  const strokeDashoffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

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
  const [showTripCalculator, setShowTripCalculator] = useState(false);
  const [tripDistance, setTripDistance] = useState('');
  const [tripCost, setTripCost] = useState('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Reactions & Effects
  useEffect(() => {
    const dispose = reaction(
      () => {
        const {favorites, stations} = stationsStore;
        return stations
          .filter(s => favorites.includes(s.id) && s.isPromo)
          .map(s => s.id)
          .join(',');
      },
      promoIds => {
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
        s => favorites.includes(s.id) && s.isPromo,
      );
      if (promoStations.length > 0) {
        const stationNames = promoStations.map(s => s.name).join(', ');
        setPromoMessage(`Promoção nos favoritos: ${stationNames}!`);
      } else {
        setPromoMessage(null);
      }
    }
  };

  const calculateTripCost = () => {
    const {bestStation} = stationsStore;
    const {etanolConsumption, gasolinaConsumption} = homeStore;

    if (!tripDistance || !bestStation) {
      return;
    }

    const distance = parseFloat(tripDistance.replace(',', '.'));
    const gasCons = parseFloat(gasolinaConsumption.replace(',', '.')) || 10;
    const ethCons = parseFloat(etanolConsumption.replace(',', '.')) || 7;

    if (isNaN(distance)) {
      return;
    }

    const costGas = (distance / gasCons) * bestStation.priceGas;
    const costEth = (distance / ethCons) * bestStation.priceEthanol;

    const bestOption = costEth < costGas ? 'Etanol' : 'Gasolina';
    const bestPrice = Math.min(costGas, costEth);

    setTripCost(`R$ ${bestPrice.toFixed(2)} com ${bestOption}`);
  };

  const renderActivityItem = item => {
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
            accessoryLeft={props => (
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

        {/* Smart Choice */}
        <Text category="h6" style={styles.sectionTitle}>
          Smart Fuel Choice
        </Text>
        <SmartFuelCard stationsStore={stationsStore} />

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
            onPress={() => setShowTripCalculator(true)}>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}>
              <Icon name="map-outline" width={32} height={32} fill="#3366FF" />
              <Text category="s2" style={{marginTop: 10}}>
                Trip Calculator
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
          {stationsStore.badges.map(badge => (
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
              onChangeText={t => homeStore.handleForm({etanol: t})}
              keyboardType="numeric"
              style={{flex: 1, marginRight: 5}}
            />
            <Input
              placeholder="Gasolina"
              value={homeStore.gasolina}
              onChangeText={t => homeStore.handleForm({gasolina: t})}
              keyboardType="numeric"
              style={{flex: 1, marginLeft: 5}}
            />
          </View>
          <View style={{marginTop: 10}}>
            {homeStore.resultado ? (
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

      {/* Modal */}
      <Modal
        visible={showTripCalculator}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setShowTripCalculator(false)}>
        <Card disabled={true} style={styles.modalCard}>
          <Text category="h5" style={{marginBottom: 10}}>
            Trip Calculator
          </Text>
          <Input
            label="Distance (km)"
            placeholder="Ex: 150"
            value={tripDistance}
            onChangeText={setTripDistance}
            keyboardType="numeric"
            style={styles.input}
          />
          {tripCost ? (
            <Text
              status="success"
              category="h6"
              style={{marginVertical: 10, textAlign: 'center'}}>
              {tripCost}
            </Text>
          ) : null}
          <Button onPress={calculateTripCost} style={{marginBottom: 10}}>
            Calculate
          </Button>
          <Button
            appearance="ghost"
            onPress={() => setShowTripCalculator(false)}>
            Close
          </Button>
        </Card>
      </Modal>
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
});

export default Home;
