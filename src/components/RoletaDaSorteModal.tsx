import {secureRandom} from '../utils/random';
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Modal as RNModal,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import {Card, Text, Button, Icon} from '@ui-kitten/components';
import {observer} from 'mobx-react';
import StationsStore from '../stores/stations.store';

const {width} = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  stationsStore: StationsStore;
}

const EMOJIS = ['⛽', '💰', '🚗', '💸', '🍀', '🌟'];

const FORTUNES = [
  'Hoje seu carro vai gastar menos que camelo no deserto!',
  'Cuidado com o pé pesado, a gasolina tá cara e seu bolso agradece.',
  'Um posto com gasolina barata cruzará seu caminho em breve.',
  'Sua próxima viagem será suave e econômica.',
  'Os deuses do etanol sorriem para você hoje.',
  'Evite o ar condicionado hoje, o clima está a favor da economia!',
];

const RoletaDaSorteModal = observer(
  ({visible, onClose, stationsStore}: Props) => {
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState([
      {id: 'slot-0', emoji: '❓'},
      {id: 'slot-1', emoji: '❓'},
      {id: 'slot-2', emoji: '❓'},
    ]);
    const [fortune, setFortune] = useState('');
    const [won, setWon] = useState(false);

    // Simple animation for the slots
    const [spinAnim] = useState(new Animated.Value(0));

    useEffect(() => {
      if (visible) {
        setResult([
          {id: 'slot-0', emoji: '❓'},
          {id: 'slot-1', emoji: '❓'},
          {id: 'slot-2', emoji: '❓'},
        ]);
        setFortune('');
        setWon(false);
        setSpinning(false);
        spinAnim.setValue(0);
      }
    }, [visible, spinAnim]);

    const handleSpin = () => {
      if (spinning) {
        return;
      }
      setSpinning(true);
      setWon(false);
      setFortune('');

      // Start animation
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start();

      // Randomize slots during "spin"
      let spins = 0;
      const interval = setInterval(() => {
        setResult([
          {
            id: 'slot-0',
            emoji: EMOJIS[Math.floor(secureRandom() * EMOJIS.length)],
          },
          {
            id: 'slot-1',
            emoji: EMOJIS[Math.floor(secureRandom() * EMOJIS.length)],
          },
          {
            id: 'slot-2',
            emoji: EMOJIS[Math.floor(secureRandom() * EMOJIS.length)],
          },
        ]);
        spins++;
        if (spins > 20) {
          clearInterval(interval);
          finalizeSpin();
        }
      }, 100);
    };

    const finalizeSpin = () => {
      setSpinning(false);

      // 15% chance to win just for fun, or totally random
      const isWin = secureRandom() < 0.15;
      let finalEmojis: string[] = [];

      if (isWin) {
        const winEmoji = EMOJIS[Math.floor(secureRandom() * EMOJIS.length)];
        finalEmojis = [winEmoji, winEmoji, winEmoji];
        setWon(true);
        stationsStore.addPoints(50);

        // Unlock badge if it exists
        if (stationsStore.unlockSortudoBadge) {
          stationsStore.unlockSortudoBadge();
        }

        setFortune('🎰 JACKPOT! Você ganhou 50 pontos e muita sorte!');
      } else {
        finalEmojis = [
          EMOJIS[Math.floor(secureRandom() * EMOJIS.length)],
          EMOJIS[Math.floor(secureRandom() * EMOJIS.length)],
          EMOJIS[Math.floor(secureRandom() * EMOJIS.length)],
        ];
        // Prevent accidental wins
        if (
          finalEmojis[0] === finalEmojis[1] &&
          finalEmojis[1] === finalEmojis[2]
        ) {
          finalEmojis[2] =
            EMOJIS[(EMOJIS.indexOf(finalEmojis[2]) + 1) % EMOJIS.length];
        }
        setWon(false);
        setFortune(FORTUNES[Math.floor(secureRandom() * FORTUNES.length)]);
      }

      setResult([
        {id: 'slot-0', emoji: finalEmojis[0]},
        {id: 'slot-1', emoji: finalEmojis[1]},
        {id: 'slot-2', emoji: finalEmojis[2]},
      ]);
    };

    const spinInterpolate = spinAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['0deg', '180deg', '360deg'],
    });

    return (
      <RNModal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <Card disabled={true} style={styles.modalCard}>
            <View style={styles.header}>
              <Icon name="star" width={24} height={24} fill="#FFD700" />
              <Text category="h5" style={styles.title}>
                Roleta da Sorte
              </Text>
              <Icon name="star" width={24} height={24} fill="#FFD700" />
            </View>

            <Text category="s1" appearance="hint" style={styles.subtitle}>
              Gire para ganhar pontos e uma previsão do futuro motorizado!
            </Text>

            <View style={styles.slotMachine}>
              {result.map((slot) => (
                <Animated.View
                  key={slot.id}
                  style={[
                    styles.slot,
                    {transform: spinning ? [{rotateX: spinInterpolate}] : []},
                  ]}>
                  <Text style={styles.slotText}>{slot.emoji}</Text>
                </Animated.View>
              ))}
            </View>

            {fortune !== '' && (
              <View style={[styles.fortuneBox, won && styles.fortuneBoxWon]}>
                <Text
                  category="s1"
                  style={[styles.fortuneText, won && styles.fortuneTextWon]}>
                  {fortune}
                </Text>
              </View>
            )}

            <Button
              size="giant"
              status={spinning ? 'basic' : 'primary'}
              onPress={handleSpin}
              disabled={spinning}
              style={styles.spinButton}
              accessoryLeft={(p) => <Icon {...p} name="loader-outline" />}>
              {spinning ? 'Girando...' : 'GIRAR AGORA'}
            </Button>

            <Button
              appearance="ghost"
              status="basic"
              style={styles.closeButton}
              onPress={onClose}>
              Fechar
            </Button>
          </Card>
        </View>
      </RNModal>
    );
  },
);

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
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    marginHorizontal: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  slotMachine: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#222b45',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  slot: {
    backgroundColor: '#fff',
    width: 60,
    height: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  slotText: {
    fontSize: 40,
  },
  spinButton: {
    borderRadius: 30,
    marginBottom: 10,
  },
  fortuneBox: {
    padding: 15,
    backgroundColor: '#F7F9FC',
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#3366FF',
  },
  fortuneBoxWon: {
    backgroundColor: '#FFF8E1',
    borderLeftColor: '#FFD700',
  },
  fortuneText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  fortuneTextWon: {
    fontWeight: 'bold',
    color: '#FF8C00',
    fontStyle: 'normal',
  },
  closeButton: {
    borderRadius: 30,
  },
});

export default RoletaDaSorteModal;
