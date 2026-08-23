import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Modal as RNModal, Dimensions} from 'react-native';
import {Card, Text, Button, Icon} from '@ui-kitten/components';
import {observer} from 'mobx-react';
import StationsStore from '../stores/stations.store';
import {secureRandom} from '../utils/random';

const {width} = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  stationsStore: StationsStore;
}

const INITIAL_BUDGET = 1000;
const INITIAL_STOCK_GAS = 100;
const INITIAL_STOCK_ETH = 100;
const COST_GAS = 4.5;
const COST_ETH = 3.0;
const GAME_DURATION = 30; // seconds

const PostoTycoonModal = observer(
  ({visible, onClose, stationsStore}: Props) => {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>(
      'start',
    );
    const [budget, setBudget] = useState(INITIAL_BUDGET);
    const [stockGas, setStockGas] = useState(INITIAL_STOCK_GAS);
    const [stockEth, setStockEth] = useState(INITIAL_STOCK_ETH);

    const [priceGas, setPriceGas] = useState(5.5);
    const [priceEth, setPriceEth] = useState(3.8);

    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [messages, setMessages] = useState<string[]>([]);
    const [customersServed, setCustomersServed] = useState(0);

    // Timer
    useEffect(() => {
      let timer: NodeJS.Timeout;
      if (visible && gameState === 'playing' && timeLeft > 0) {
        timer = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else if (timeLeft === 0 && gameState === 'playing') {
        endGame();
      }
      return () => clearInterval(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, gameState, timeLeft]);

    // Customer logic
    useEffect(() => {
      let customerTimer: NodeJS.Timeout;
      if (visible && gameState === 'playing' && timeLeft > 0) {
        customerTimer = setInterval(() => {
          handleCustomer();
        }, 2000 + secureRandom() * 2000); // Customer every 2-4 seconds
      }
      return () => clearInterval(customerTimer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, gameState, timeLeft, priceGas, priceEth, stockGas, stockEth]);

    const addMessage = (msg: string) => {
      setMessages((prev) => [msg, ...prev].slice(0, 4));
    };

    const handleCustomer = () => {
      const isGas = secureRandom() > 0.5;
      const requestedAmount = Math.floor(secureRandom() * 40) + 10; // 10 to 50 liters

      if (isGas) {
        if (priceGas > 6.5) {
          addMessage(
            `😠 Cliente achou a Gasolina muito cara (R$ ${priceGas.toFixed(
              2,
            )}) e foi embora!`,
          );
        } else if (stockGas < requestedAmount) {
          addMessage(`😢 Sem estoque de Gasolina para ${requestedAmount}L!`);
        } else {
          const saleValue = requestedAmount * priceGas;
          setStockGas((prev) => prev - requestedAmount);
          setBudget((prev) => prev + saleValue);
          setCustomersServed((prev) => prev + 1);
          addMessage(
            `🚗 Vendeu ${requestedAmount}L de Gasolina por R$ ${saleValue.toFixed(
              2,
            )}`,
          );
        }
      } else {
        if (priceEth > 4.5) {
          addMessage(
            `😠 Cliente achou o Etanol muito caro (R$ ${priceEth.toFixed(
              2,
            )}) e foi embora!`,
          );
        } else if (stockEth < requestedAmount) {
          addMessage(`😢 Sem estoque de Etanol para ${requestedAmount}L!`);
        } else {
          const saleValue = requestedAmount * priceEth;
          setStockEth((prev) => prev - requestedAmount);
          setBudget((prev) => prev + saleValue);
          setCustomersServed((prev) => prev + 1);
          addMessage(
            `🚙 Vendeu ${requestedAmount}L de Etanol por R$ ${saleValue.toFixed(
              2,
            )}`,
          );
        }
      }
    };

    const buyGas = () => {
      const amount = 50;
      const cost = amount * COST_GAS;
      if (budget >= cost) {
        setBudget((prev) => prev - cost);
        setStockGas((prev) => prev + amount);
        addMessage(`📦 Comprou ${amount}L de Gasolina`);
      } else {
        addMessage('❌ Dinheiro insuficiente para Gasolina!');
      }
    };

    const buyEth = () => {
      const amount = 50;
      const cost = amount * COST_ETH;
      if (budget >= cost) {
        setBudget((prev) => prev - cost);
        setStockEth((prev) => prev + amount);
        addMessage(`📦 Comprou ${amount}L de Etanol`);
      } else {
        addMessage('❌ Dinheiro insuficiente para Etanol!');
      }
    };

    const startGame = () => {
      setGameState('playing');
      setBudget(INITIAL_BUDGET);
      setStockGas(INITIAL_STOCK_GAS);
      setStockEth(INITIAL_STOCK_ETH);
      setPriceGas(5.5);
      setPriceEth(3.8);
      setTimeLeft(GAME_DURATION);
      setMessages([]);
      setCustomersServed(0);
    };

    const endGame = () => {
      setGameState('end');

      // Rewards
      let points = 10; // Base participation
      if (budget > INITIAL_BUDGET) {
        points += Math.floor((budget - INITIAL_BUDGET) / 10);
      }
      stationsStore.addPoints(points);

      // Badge condition: More than R$ 2000
      if (budget >= 2000 && stationsStore.unlockTycoonBadge) {
        stationsStore.unlockTycoonBadge();
      }
    };

    const handleClose = () => {
      if (gameState === 'playing') {
        endGame();
      }
      setGameState('start');
      onClose();
    };

    return (
      <RNModal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}>
        <View style={styles.backdrop}>
          <Card disabled={true} style={styles.modalCard}>
            <View style={styles.header}>
              <Icon
                name="briefcase-outline"
                width={32}
                height={32}
                fill="#3366FF"
              />
              <Text category="h4" style={styles.title}>
                Posto Tycoon
              </Text>
            </View>

            {gameState === 'start' && (
              <View style={styles.centerContent}>
                <Text style={{textAlign: 'center', marginBottom: 20}}>
                  Gerencie seu próprio posto de combustível! Compre estoque,
                  defina os preços e atenda os clientes antes que o tempo acabe.
                </Text>
                <Text
                  style={{
                    textAlign: 'center',
                    marginBottom: 20,
                    fontWeight: 'bold',
                  }}>
                  Objetivo: Terminar com mais de R$ 2.000!
                </Text>
                <Button size="large" status="primary" onPress={startGame}>
                  COMEÇAR JOGO
                </Button>
              </View>
            )}

            {gameState === 'playing' && (
              <View>
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text category="c1" appearance="hint">
                      Caixa
                    </Text>
                    <Text category="h6" status="success">
                      R$ {budget.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text category="c1" appearance="hint">
                      Tempo
                    </Text>
                    <Text
                      category="h6"
                      status={timeLeft <= 10 ? 'danger' : 'primary'}>
                      {timeLeft}s
                    </Text>
                  </View>
                </View>

                <View style={styles.fuelContainer}>
                  {/* Gasolina */}
                  <View style={styles.fuelCol}>
                    <Text
                      category="s1"
                      style={{color: '#FF3D71', fontWeight: 'bold'}}>
                      Gasolina
                    </Text>
                    <Text category="c1">Estoque: {stockGas}L</Text>
                    <View style={styles.priceControl}>
                      <Button
                        size="tiny"
                        onPress={() =>
                          setPriceGas((p) => Math.max(COST_GAS + 0.1, p - 0.1))
                        }>
                        -
                      </Button>
                      <Text style={{marginHorizontal: 10, fontWeight: 'bold'}}>
                        R$ {priceGas.toFixed(2)}
                      </Text>
                      <Button
                        size="tiny"
                        onPress={() => setPriceGas((p) => p + 0.1)}>
                        +
                      </Button>
                    </View>
                    <Button
                      size="small"
                      appearance="outline"
                      onPress={buyGas}
                      style={{marginTop: 10}}>
                      Comprar (R$ 225)
                    </Button>
                  </View>

                  <View
                    style={{
                      width: 1,
                      backgroundColor: '#EDF1F7',
                      marginHorizontal: 10,
                    }}
                  />

                  {/* Etanol */}
                  <View style={styles.fuelCol}>
                    <Text
                      category="s1"
                      style={{color: '#00E096', fontWeight: 'bold'}}>
                      Etanol
                    </Text>
                    <Text category="c1">Estoque: {stockEth}L</Text>
                    <View style={styles.priceControl}>
                      <Button
                        size="tiny"
                        onPress={() =>
                          setPriceEth((p) => Math.max(COST_ETH + 0.1, p - 0.1))
                        }>
                        -
                      </Button>
                      <Text style={{marginHorizontal: 10, fontWeight: 'bold'}}>
                        R$ {priceEth.toFixed(2)}
                      </Text>
                      <Button
                        size="tiny"
                        onPress={() => setPriceEth((p) => p + 0.1)}>
                        +
                      </Button>
                    </View>
                    <Button
                      size="small"
                      appearance="outline"
                      onPress={buyEth}
                      style={{marginTop: 10}}>
                      Comprar (R$ 150)
                    </Button>
                  </View>
                </View>

                <View style={styles.messageBoard}>
                  {messages.map((m, i) => (
                    <Text
                      key={i}
                      category="c2"
                      style={{opacity: 1 - i * 0.25, marginBottom: 2}}>
                      {m}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {gameState === 'end' && (
              <View style={styles.centerContent}>
                <Icon
                  name={budget >= 2000 ? 'star' : 'award-outline'}
                  width={64}
                  height={64}
                  fill={budget >= 2000 ? '#FFD700' : '#3366FF'}
                  style={{marginBottom: 20}}
                />
                <Text category="h5" style={{marginBottom: 10}}>
                  Tempo Esgotado!
                </Text>

                <View
                  style={{
                    backgroundColor: '#F7F9FC',
                    padding: 15,
                    borderRadius: 10,
                    width: '100%',
                    marginBottom: 20,
                  }}>
                  <Text category="s1">
                    Caixa Final:{' '}
                    <Text
                      status={budget >= INITIAL_BUDGET ? 'success' : 'danger'}>
                      R$ {budget.toFixed(2)}
                    </Text>
                  </Text>
                  <Text category="s1">
                    Lucro: R$ {(budget - INITIAL_BUDGET).toFixed(2)}
                  </Text>
                  <Text category="s1">
                    Clientes Atendidos: {customersServed}
                  </Text>
                </View>

                {budget >= 2000 && (
                  <Text
                    status="success"
                    style={{
                      fontWeight: 'bold',
                      marginBottom: 15,
                      textAlign: 'center',
                    }}>
                    Incrível! Você desbloqueou a badge Tycoon Master!
                  </Text>
                )}

                <Button
                  size="large"
                  status="primary"
                  onPress={startGame}
                  style={{marginBottom: 10, width: '100%'}}>
                  JOGAR NOVAMENTE
                </Button>
                <Button
                  size="large"
                  appearance="ghost"
                  onPress={handleClose}
                  style={{width: '100%'}}>
                  SAIR
                </Button>
              </View>
            )}

            {gameState === 'start' && (
              <Button
                appearance="ghost"
                status="basic"
                style={styles.closeButton}
                onPress={handleClose}>
                Fechar
              </Button>
            )}
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
    width: width * 0.95,
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#fff',
    maxHeight: '90%',
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
    color: '#3366FF',
  },
  centerContent: {
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: '#F7F9FC',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  fuelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  fuelCol: {
    flex: 1,
    alignItems: 'center',
  },
  priceControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  messageBoard: {
    backgroundColor: '#222B45',
    padding: 10,
    borderRadius: 10,
    height: 100,
    overflow: 'hidden',
  },
  closeButton: {
    marginTop: 15,
  },
});

export default PostoTycoonModal;
