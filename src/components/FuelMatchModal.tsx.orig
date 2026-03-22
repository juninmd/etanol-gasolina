import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import {Modal, Card, Text, Button, Icon} from '@ui-kitten/components';

const {width} = Dimensions.get('window');

interface Station {
  id: number;
  name: string;
  priceGas: number;
  priceEthanol: number;
  isPromo: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  stations: Station[];
  onMatch: (stationId: number) => void;
}

const FuelMatchModal = ({visible, onClose, stations, onMatch}: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  // Reset when opened
  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      position.setValue({x: 0, y: 0});
    }
  }, [visible, position]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({x: gestureState.dx, y: gestureState.dy});
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 120) {
          forceSwipe('right');
        } else if (gestureState.dx < -120) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    }),
  ).current;

  const forceSwipe = (direction: 'right' | 'left') => {
    const x = direction === 'right' ? width : -width;
    Animated.timing(position, {
      toValue: {x, y: direction === 'right' ? -100 : 100},
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'right' | 'left') => {
    const item = stations[currentIndex];
    if (direction === 'right' && item) {
      onMatch(item.id);
      onClose();
    } else {
      position.setValue({x: 0, y: 0});
      setCurrentIndex(prev => prev + 1);
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: {x: 0, y: 0},
      friction: 4,
      useNativeDriver: false,
    }).start();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-width / 2, 0, width / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp',
    });

    return {
      ...position.getLayout(),
      transform: [{rotate}],
    };
  };

  const currentStation = stations[currentIndex];

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon
            name="droplet"
            width={24}
            height={24}
            fill="#FF3D71"
            style={{marginRight: 8}}
          />
          <Text category="h5" style={{color: '#fff', fontWeight: 'bold'}}>
            Fuel Match
          </Text>
        </View>

        {currentStation ? (
          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.cardContainer, getCardStyle()]}>
            <Card style={styles.card} disabled>
              <View style={{alignItems: 'center', marginBottom: 20}}>
                {currentStation.isPromo && (
                  <View style={styles.promoBadge}>
                    <Text
                      category="c2"
                      style={{color: 'white', fontWeight: 'bold'}}>
                      PROMO
                    </Text>
                  </View>
                )}
                <Text category="h4" style={{textAlign: 'center'}}>
                  {currentStation.name}
                </Text>
                <Text category="s1" appearance="hint" style={{marginTop: 5}}>
                  Deslize para escolher
                </Text>
              </View>

              <View style={styles.priceRow}>
                <View style={styles.priceBox}>
                  <Text category="c1" appearance="hint">
                    Gasolina
                  </Text>
                  <Text category="h6" status="primary">
                    R$ {currentStation.priceGas.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.priceBox}>
                  <Text category="c1" appearance="hint">
                    Etanol
                  </Text>
                  <Text category="h6" status="success">
                    R$ {currentStation.priceEthanol.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <Button
                  style={[
                    styles.actionButton,
                    {backgroundColor: '#FF3D71', borderColor: '#FF3D71'},
                  ]}
                  accessoryLeft={props => (
                    <Icon {...props} name="close-outline" />
                  )}
                  onPress={() => forceSwipe('left')}
                />
                <Button
                  style={[
                    styles.actionButton,
                    {backgroundColor: '#00E096', borderColor: '#00E096'},
                  ]}
                  accessoryLeft={props => <Icon {...props} name="heart" />}
                  onPress={() => forceSwipe('right')}
                />
              </View>
            </Card>
          </Animated.View>
        ) : (
          <Card style={styles.card} disabled>
            <View style={{alignItems: 'center', padding: 20}}>
              <Icon
                name="search-outline"
                width={48}
                height={48}
                fill="#8F9BB3"
                style={{marginBottom: 10}}
              />
              <Text category="h6" style={{textAlign: 'center'}}>
                Fim da lista!
              </Text>
              <Text
                category="s1"
                appearance="hint"
                style={{textAlign: 'center', marginTop: 10, marginBottom: 20}}>
                Você viu todos os postos próximos.
              </Text>
              <Button onPress={onClose} status="primary">
                FECHAR
              </Button>
            </View>
          </Card>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardContainer: {
    width: width * 0.85,
    maxWidth: 400,
  },
  card: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    paddingVertical: 10,
  },
  promoBadge: {
    backgroundColor: '#FF3D71',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  priceBox: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(143, 155, 179, 0.1)',
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});

export default FuelMatchModal;
