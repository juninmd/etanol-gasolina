import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Animated, Dimensions} from 'react-native';
import {Modal, Card, Text, Button, Icon} from '@ui-kitten/components';
import {observer} from 'mobx-react';
import StationsStore from '../stores/stations.store';
import {secureRandom} from '../utils/random';

const {width} = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  stationsStore: StationsStore;
}

const UPSELL_OPTIONS = [
  'Completar a água do radiador (com água da torneira)',
  'Trocar o óleo que ainda tá na metade da vida útil',
  'Aditivo mágico que aumenta a potência em 200%',
  'Trocar as palhetas porque "vai chover forte amanhã"',
  'Calibrar os pneus com nitrogênio gourmet',
  'Lavar o para-brisa com shampoo de pH neutro',
];

const DetectorMentirasModal = observer(({visible, onClose, stationsStore}: Props) => {
  const [animation] = useState(() => new Animated.Value(0));
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<'cilada' | 'seguro' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
      setResult(null);
      setSelectedOption(null);
      setAnalyzing(false);
    } else {
      animation.setValue(0);
    }
  }, [visible, animation]);

  const analyze = (option: string) => {
    setSelectedOption(option);
    setAnalyzing(true);
    setResult(null);

    // Simulate analysis delay
    setTimeout(() => {
      setAnalyzing(false);
      // Most upsells in this joke feature are "cilada" (traps)
      const isCilada = secureRandom() > 0.2;
      setResult(isCilada ? 'cilada' : 'seguro');

      // Award badge and points
      if (stationsStore.unlockDetectorBadge) {
        stationsStore.unlockDetectorBadge();
      }
      stationsStore.addPoints(30);
    }, 2000);
  };

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
        <Card disabled={true} style={styles.card}>
          <View style={styles.header}>
            <Icon name="shield-outline" width={32} height={32} fill="#FF3D71" />
            <Text category="h4" style={styles.title}>
              Detector de Cilada
            </Text>
          </View>

          <Text category="s1" style={styles.subtitle}>
            O frentista ofereceu algo? Vamos analisar!
          </Text>

          {!analyzing && !result && (
            <View style={styles.optionsContainer}>
              {UPSELL_OPTIONS.map((option, idx) => (
                <Button
                  key={idx}
                  style={styles.optionButton}
                  appearance="outline"
                  status="danger"
                  size="small"
                  onPress={() => analyze(option)}>
                  {option}
                </Button>
              ))}
            </View>
          )}

          {analyzing && (
            <View style={styles.analyzingContainer}>
              <Icon
                name="loader-outline"
                width={48}
                height={48}
                fill="#FF3D71"
                animation="spin"
              />
              <Text category="h6" style={{marginTop: 15, color: '#FF3D71'}}>
                Analisando a lábia...
              </Text>
            </View>
          )}

          {result && (
            <View style={styles.resultContainer}>
              <View style={[styles.resultBox, {backgroundColor: result === 'cilada' ? '#FFE5E5' : '#E5F9F1'}]}>
                <Icon
                  name={result === 'cilada' ? 'alert-triangle-outline' : 'checkmark-circle-outline'}
                  width={60}
                  height={60}
                  fill={result === 'cilada' ? '#FF3D71' : '#00E096'}
                />
                <Text category="h3" style={[styles.resultTitle, {color: result === 'cilada' ? '#FF3D71' : '#00E096'}]}>
                  {result === 'cilada' ? 'É CILADA, BINO!' : 'PODE CONFIAR!'}
                </Text>
                <Text category="s1" style={styles.resultText}>
                  {result === 'cilada'
                    ? `Fuja! A chance de "${selectedOption}" ser um golpe para tirar seu dinheiro é enorme.`
                    : 'Milagre! Dessa vez parece que ele realmente só quer ajudar seu carro.'}
                </Text>
              </View>

              <Text category="c1" status="success" style={{textAlign: 'center', marginTop: 10}}>
                +30 XP - Badge Mestre Anti-Cilada 🛡️
              </Text>

              <Button style={{marginTop: 15}} onPress={onClose} status="primary">
                Entendido
              </Button>
            </View>
          )}

          {!result && !analyzing && (
            <Button
              appearance="ghost"
              status="basic"
              style={{marginTop: 15}}
              onPress={onClose}>
              Voltar
            </Button>
          )}
        </Card>
      </Animated.View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
  },
  card: {
    borderRadius: 20,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    color: '#FF3D71',
    marginLeft: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#8F9BB3',
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  optionButton: {
    justifyContent: 'flex-start',
  },
  analyzingContainer: {
    alignItems: 'center',
    padding: 30,
  },
  resultContainer: {
    alignItems: 'stretch',
  },
  resultBox: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  resultText: {
    textAlign: 'center',
    color: '#222B45',
  },
});

export default DetectorMentirasModal;
