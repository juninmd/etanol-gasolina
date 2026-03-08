import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Animated, Dimensions} from 'react-native';
import {Card, Text, Button, Input, Icon, Layout} from '@ui-kitten/components';
import {inject, observer} from 'mobx-react';
import StationsStore, {Station} from '../stores/stations.store';

interface Props {
  stationsStore?: StationsStore;
}

const {width, height} = Dimensions.get('window');

const CheckinPrompt = inject('stationsStore')(
  observer(({stationsStore}: Props) => {
    const {checkinStation} = stationsStore!;

    // Local State to manage visibility and animations
    const [visibleStation, setVisibleStation] = useState<Station | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [gasPrice, setGasPrice] = useState('');
    const [ethPrice, setEthPrice] = useState('');

    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
      if (checkinStation) {
        // New station prompt
        setVisibleStation(checkinStation);
        setIsSuccess(false);
        // Set isUpdating to true by default to force the user to input/confirm the price directly
        setIsUpdating(true);
        setGasPrice(checkinStation.priceGas.toString());
        setEthPrice(checkinStation.priceEthanol.toString());

        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }).start();
      } else {
        // Dismiss
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setVisibleStation(null);
        });
      }
    }, [checkinStation]);

    if (!visibleStation) {
      return null;
    }

    const handleDismiss = () => {
      // Just clear the store, useEffect will handle the animation out
      stationsStore!.dismissCheckin();
    };

    const handleConfirm = () => {
      if (visibleStation) {
        stationsStore!.verifyPrice(visibleStation.id);
        setIsSuccess(true);
        setTimeout(handleDismiss, 2000);
      }
    };

    const handleUpdate = () => {
      if (!visibleStation) return;
      const gas = parseFloat(gasPrice);
      const eth = parseFloat(ethPrice);

      if (!isNaN(gas) && !isNaN(eth)) {
        stationsStore!.updatePrice(visibleStation.id, gas, eth);
        setIsSuccess(true);
        setTimeout(handleDismiss, 2000);
      }
    };

    if (isSuccess) {
      return (
        <Animated.View
          style={[styles.container, {transform: [{translateY: slideAnim}]}]}>
          <Card
            style={[
              styles.card,
              {backgroundColor: '#00E096', borderColor: '#00E096'},
            ]}>
            <View style={{alignItems: 'center', padding: 20}}>
              <Icon
                name="checkmark-circle-2"
                width={60}
                height={60}
                fill="#fff"
              />
              <Text
                category="h5"
                style={{color: '#fff', marginTop: 10, fontWeight: 'bold'}}>
                Sucesso!
              </Text>
              <Text category="s1" style={{color: '#fff'}}>
                + Pontos Adicionados
              </Text>
            </View>
          </Card>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[styles.container, {transform: [{translateY: slideAnim}]}]}>
        <Card style={styles.card} status="primary">
          <View style={styles.header}>
            <Icon name="pin" width={24} height={24} fill="#3366FF" />
            <Text category="h6" style={{marginLeft: 10}}>
              Você está aqui?
            </Text>
          </View>

          <Text category="s1" style={{marginVertical: 5, textAlign: 'center'}}>
            {visibleStation.name}
          </Text>
          <Text category="p2" style={{marginBottom: 15, textAlign: 'center', color: '#8F9BB3'}}>
            Qual o preço atual? Confirme ou altere para ganhar pontos!
          </Text>

          <View style={styles.inputsRow}>
            <Input
              style={styles.input}
              label="Gasolina"
              value={gasPrice}
              onChangeText={setGasPrice}
              keyboardType="numeric"
            />
            <Input
              style={styles.input}
              label="Etanol"
              value={ethPrice}
              onChangeText={setEthPrice}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.buttonRow}>
            <Button
              status="basic"
              appearance="ghost"
              onPress={handleDismiss}
              style={{flex: 1, marginRight: 10}}>
              Ignorar
            </Button>
            <Button
              status="success"
              onPress={handleUpdate}
              style={{flex: 1}}>
              Confirmar
            </Button>
          </View>
        </Card>
      </Animated.View>
    );
  }),
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 100, // Above everything
  },
  card: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pricePreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    backgroundColor: '#F7F9FC',
    padding: 10,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default CheckinPrompt;
