import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Animated, Dimensions} from 'react-native';
import {
  Modal,
  Card,
  Text,
  Button,
  Icon,
  Layout,
  Spinner,
} from '@ui-kitten/components';
import {observer} from 'mobx-react';

const {width, height} = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

const HISTORICAL_DATA = [
  {year: 1995, gas: 0.53, eth: 0.39, event: 'Plano Real iniciando!'},
  {
    year: 2005,
    gas: 2.3,
    eth: 1.45,
    event: 'Lançamento de carros Flex populares.',
  },
  {year: 2015, gas: 3.32, eth: 2.15, event: 'Crise e alta do dólar.'},
  {year: 2024, gas: 5.59, eth: 3.79, event: 'Hoje.'},
  {year: 2030, gas: 8.5, eth: 5.2, event: 'Previsão IA (Otimista).'},
];

const TimeMachineModal = observer(({visible, onClose}: Props) => {
  const [currentYearIndex, setCurrentYearIndex] = useState(3); // Start at 2024
  const [isTraveling, setIsTraveling] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setCurrentYearIndex(3);
    }
  }, [visible]);

  const travelTo = (index: number) => {
    setIsTraveling(true);

    // Spin effect
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      setCurrentYearIndex(index);
      setIsTraveling(false);
      spinAnim.setValue(0);
    });
  };

  if (!visible) {
    return null;
  }

  const currentData = HISTORICAL_DATA[currentYearIndex];

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1080deg'], // 3 full spins
  });

  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => !isTraveling && onClose()}>
      <Card disabled={true} style={styles.modalCard}>
        <View style={styles.header}>
          <Icon name="clock-outline" width={24} height={24} fill="#FF3D71" />
          <Text category="h5" style={{marginLeft: 10, fontWeight: 'bold'}}>
            Máquina do Tempo
          </Text>
        </View>

        <View style={styles.content}>
          {isTraveling ? (
            <Animated.View
              style={{alignItems: 'center', transform: [{rotate: spin}]}}>
              <Icon
                name="loader-outline"
                width={80}
                height={80}
                fill="#FF3D71"
              />
              <Text category="h6" style={{marginTop: 20}}>
                Viajando no tempo...
              </Text>
            </Animated.View>
          ) : (
            <Animated.View
              style={{
                alignItems: 'center',
                opacity: spinAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 0, 1],
                }),
              }}>
              <Text category="h1" style={{color: '#FF3D71', fontSize: 60}}>
                {currentData.year}
              </Text>
              <Text
                category="s1"
                appearance="hint"
                style={{textAlign: 'center', marginVertical: 10}}>
                {currentData.event}
              </Text>

              <View style={styles.priceRow}>
                <View style={styles.priceBox}>
                  <Text category="c1" appearance="hint">
                    Gasolina
                  </Text>
                  <Text category="h5" status="primary">
                    R$ {currentData.gas.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.priceBox}>
                  <Text category="c1" appearance="hint">
                    Etanol
                  </Text>
                  <Text category="h5" status="success">
                    R$ {currentData.eth.toFixed(2)}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}
        </View>

        {!isTraveling && (
          <View style={styles.timeline}>
            {HISTORICAL_DATA.map((data, index) => (
              <Button
                key={data.year}
                size="tiny"
                appearance={currentYearIndex === index ? 'filled' : 'outline'}
                status="danger"
                style={styles.yearButton}
                onPress={() => travelTo(index)}>
                {data.year.toString()}
              </Button>
            ))}
          </View>
        )}

        <Button
          appearance="ghost"
          onPress={onClose}
          status="basic"
          disabled={isTraveling}>
          Voltar para o Presente
        </Button>
      </Card>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalCard: {
    width: width * 0.9,
    borderRadius: 20,
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
    paddingBottom: 15,
    marginBottom: 20,
  },
  content: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  priceBox: {
    alignItems: 'center',
    marginHorizontal: 15,
    backgroundColor: '#F7F9FC',
    padding: 15,
    borderRadius: 12,
    minWidth: 100,
  },
  timeline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 20,
  },
  yearButton: {
    margin: 4,
  },
});

export default TimeMachineModal;
