import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Modal as RNModal, Dimensions, TouchableWithoutFeedback} from 'react-native';
import {Card, Text, Button, Icon} from '@ui-kitten/components';
import {observer} from 'mobx-react';
import StationsStore from '../stores/stations.store';

const {width} = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  stationsStore: StationsStore;
}

const PeNaTabuaModal = observer(({visible, onClose, stationsStore}: Props) => {
  const [isPressing, setIsPressing] = useState(false);
  const [moneyBurned, setMoneyBurned] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!visible) {
      setMoneyBurned(0);
      setIsPressing(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [visible]);

  useEffect(() => {
    if (isPressing) {
      intervalRef.current = setInterval(() => {
        setMoneyBurned((prev) => {
          const next = prev + 0.15; // Burn rate

          if (next >= 10 && stationsStore.unlockPePesadoBadge) {
              stationsStore.unlockPePesadoBadge();
          }

          return next;
        });
      }, 50);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPressing, stationsStore]);

  const handlePressIn = () => setIsPressing(true);
  const handlePressOut = () => setIsPressing(false);

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Card disabled={true} style={styles.modalCard}>
          <View style={styles.header}>
            <Icon name="alert-triangle-outline" width={32} height={32} fill="#FF3D71" />
            <Text category="h4" style={styles.title}>
              Pé na Tábua!
            </Text>
            <Icon name="alert-triangle-outline" width={32} height={32} fill="#FF3D71" />
          </View>

          <View style={styles.messageBox}>
            <Text category="s1" style={styles.messageText}>
              Acelerar parado gasta combustível à toa! Segure o pedal para ver quanto você está queimando.
            </Text>
          </View>

          <View style={styles.counterBox}>
            <Text category="h2" style={[styles.counterText, {color: moneyBurned > 5 ? '#FF3D71' : '#222B45'}]}>
              R$ {moneyBurned.toFixed(2)}
            </Text>
            <Text category="c1" appearance="hint">
              Dinheiro queimado 💸
            </Text>
          </View>

          <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}>
            <View style={[styles.pedal, isPressing && styles.pedalPressed]}>
              <Text category="h6" style={styles.pedalText}>
                ACELERAR
              </Text>
            </View>
          </TouchableWithoutFeedback>

          <Button
            appearance="ghost"
            status="basic"
            style={styles.closeButton}
            onPress={onClose}>
            Parar de gastar
          </Button>
        </Card>
      </View>
    </RNModal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: width * 0.9,
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    marginHorizontal: 10,
    fontWeight: 'bold',
    color: '#FF3D71',
  },
  messageBox: {
    padding: 15,
    backgroundColor: '#FFF0F5',
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF3D71',
  },
  messageText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#222B45',
  },
  counterBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  counterText: {
    fontWeight: 'bold',
  },
  pedal: {
    backgroundColor: '#8F9BB3',
    height: 120,
    width: 100,
    alignSelf: 'center',
    borderRadius: 10,
    borderBottomWidth: 10,
    borderColor: '#434A5E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pedalPressed: {
    backgroundColor: '#3366FF',
    borderColor: '#1939B7',
    transform: [{translateY: 5}],
    borderBottomWidth: 5,
  },
  pedalText: {
    color: '#fff',
    fontWeight: 'bold',
    transform: [{rotate: '-90deg'}],
  },
  closeButton: {
    borderRadius: 30,
  },
});

export default PeNaTabuaModal;
