import React, {useState, useEffect, useCallback} from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import {Modal, Card, Text, Button} from '@ui-kitten/components';
import {observer} from 'mobx-react';
import {StationsStore} from '../stores/stations.store';

interface Props {
  visible: boolean;
  onClose: () => void;
  stationsStore: StationsStore;
}

const GAME_DURATION = 30; // 30 seconds

const FrentistaSimulatorModal: React.FC<Props> = observer(
  ({visible, onClose, stationsStore}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [currentCarTarget, setCurrentCarTarget] = useState<
      'gasolina' | 'etanol'
    >('gasolina');
    const [gameOver, setGameOver] = useState(false);

    const endGame = useCallback(() => {
      setIsPlaying(false);
      setGameOver(true);
      if (score >= 10 && !stationsStore.badges.includes('frentista_do_mes')) {
        stationsStore.badges.push('frentista_do_mes');
      }
    }, [score, stationsStore.badges]);

    useEffect(() => {
      let timer: NodeJS.Timeout;
      if (isPlaying && timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      } else if (isPlaying && timeLeft === 0) {
        endGame();
      }
      return () => clearTimeout(timer);
    }, [isPlaying, timeLeft, endGame]);

    const startGame = () => {
      setIsPlaying(true);
      setScore(0);
      setTimeLeft(GAME_DURATION);
      setGameOver(false);
      nextCar();
    };

    const nextCar = () => {
      setCurrentCarTarget(Math.random() > 0.5 ? 'gasolina' : 'etanol');
    };

    const handlePumpClick = (fuelType: 'gasolina' | 'etanol') => {
      if (!isPlaying) {
        return;
      }
      if (fuelType === currentCarTarget) {
        setScore((s) => s + 1);
        nextCar();
      } else {
        // Penalty or just new car? Let's say -1 score for wrong fuel
        setScore((s) => Math.max(0, s - 1));
        nextCar();
      }
    };

    const renderGame = () => (
      <View style={styles.gameContainer}>
        <View style={styles.header}>
          <Text style={styles.score}>Pontos: {score}</Text>
          <Text style={styles.timer}>Tempo: {timeLeft}s</Text>
        </View>

        <View style={styles.carArea}>
          <Text style={styles.carEmoji}>🚗</Text>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              Quero {currentCarTarget === 'gasolina' ? 'Gasolina' : 'Etanol'}!
            </Text>
          </View>
        </View>

        <View style={styles.pumpsContainer}>
          <TouchableOpacity
            style={[styles.pump, {backgroundColor: '#FF3D71'}]}
            onPress={() => handlePumpClick('gasolina')}>
            <Text style={styles.pumpIcon}>⛽</Text>
            <Text style={styles.pumpText}>Gasolina</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pump, {backgroundColor: '#00E096'}]}
            onPress={() => handlePumpClick('etanol')}>
            <Text style={styles.pumpIcon}>⛽</Text>
            <Text style={styles.pumpText}>Etanol</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    const renderResult = () => (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Fim de Turno!</Text>
        <Text style={styles.resultScore}>Você atendeu {score} carros.</Text>
        {score >= 10 && (
          <Text style={styles.badgeText}>
            🏆 Ganhou a badge Frentista do Mês!
          </Text>
        )}
        <Button style={styles.button} onPress={startGame}>
          JOGAR NOVAMENTE
        </Button>
      </View>
    );

    const renderStartScreen = () => (
      <View style={styles.startContainer}>
        <Text style={styles.startTitle}>Simulador Frentista</Text>
        <Text style={styles.startDesc}>
          Atenda os clientes com o combustível correto antes que o tempo acabe!
        </Text>
        <Button style={styles.button} onPress={startGame}>
          INICIAR TURNO
        </Button>
      </View>
    );

    return (
      <Modal
        visible={visible}
        backdropStyle={styles.backdrop}
        onBackdropPress={onClose}>
        <Card disabled={true} style={styles.card}>
          {!isPlaying && !gameOver && renderStartScreen()}
          {isPlaying && renderGame()}
          {gameOver && renderResult()}
          <Button
            appearance="ghost"
            onPress={onClose}
            style={styles.closeButton}>
            Fechar
          </Button>
        </Card>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    width: 320,
    borderRadius: 15,
  },
  gameContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  score: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#3366FF',
  },
  timer: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FF3D71',
  },
  carArea: {
    alignItems: 'center',
    marginVertical: 20,
    height: 120,
  },
  carEmoji: {
    fontSize: 60,
  },
  bubble: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  bubbleText: {
    fontWeight: 'bold',
    color: '#333',
  },
  pumpsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  pump: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    width: 100,
  },
  pumpIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  pumpText: {
    color: 'white',
    fontWeight: 'bold',
  },
  startContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  startTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  startDesc: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3366FF',
  },
  resultScore: {
    fontSize: 18,
    marginBottom: 15,
  },
  badgeText: {
    color: '#00D084',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    width: '100%',
  },
  closeButton: {
    marginTop: 10,
  },
});

export default FrentistaSimulatorModal;
