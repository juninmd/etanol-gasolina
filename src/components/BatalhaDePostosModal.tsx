import { secureRandom } from "../utils/random";
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Modal as RNModal,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {Card, Text, Button, Icon} from '@ui-kitten/components';
import {observer} from 'mobx-react';
import StationsStore, {Station} from '../stores/stations.store';

const {width} = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  stationsStore: StationsStore;
}


const getRating = (station: Station) => {
  if (!station.comments || station.comments.length === 0) {
    return 0;
  }
  return (
    station.comments.reduce((sum, c) => sum + c.rating, 0) /
    station.comments.length
  );
};

const BatalhaDePostosModal = observer(
  ({visible, onClose, stationsStore}: Props) => {
    const [playerCard, setPlayerCard] = useState<Station | null>(null);
    const [aiCard, setAiCard] = useState<Station | null>(null);
    const [selectedStat, setSelectedStat] = useState<string | null>(null);
    const [gamePhase, setGamePhase] = useState<
      'start' | 'playing' | 'reveal' | 'result'
    >('start');
    const [resultMessage, setResultMessage] = useState('');
    const [playerWon, setPlayerWon] = useState(false);

    const resetGame = () => {
      setGamePhase('start');
      setSelectedStat(null);
      setResultMessage('');
      setPlayerWon(false);

      if (stationsStore.stations.length >= 2) {
        // Pick 2 random unique stations
        const shuffled = [...stationsStore.stations].sort(
          () => 0.5 - secureRandom(),
        );
        setPlayerCard(shuffled[0]);
        setAiCard(shuffled[1]);
      } else {
        setPlayerCard(null);
        setAiCard(null);
      }
    };

    useEffect(() => {
      if (visible) {
        resetGame();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const startGame = () => {
      setGamePhase('playing');
    };

    const handleStatSelect = (statName: string) => {
      setSelectedStat(statName);
      setGamePhase('reveal');
      setTimeout(() => evaluateWinner(statName), 1500);
    };

    const evaluateWinner = (statName: string) => {
      if (!playerCard || !aiCard) {
        return;
      }

      let playerVal = 0;
      let aiVal = 0;
      let lowerIsBetter = false;

      if (statName === 'gas') {
        playerVal = playerCard.priceGas;
        aiVal = aiCard.priceGas;
        lowerIsBetter = true;
      } else if (statName === 'ethanol') {
        playerVal = playerCard.priceEthanol;
        aiVal = aiCard.priceEthanol;
        lowerIsBetter = true;
      } else if (statName === 'verifications') {
        playerVal = playerCard.verificationsCount || 0;
        aiVal = aiCard.verificationsCount || 0;
      } else if (statName === 'rating') {
        playerVal = getRating(playerCard);
        aiVal = getRating(aiCard);
      }

      let pWins = false;
      let draw = false;

      if (playerVal === aiVal) {
        draw = true;
      } else if (lowerIsBetter) {
        pWins = playerVal < aiVal;
      } else {
        pWins = playerVal > aiVal;
      }

      setGamePhase('result');
      if (draw) {
        setResultMessage('Empate! Valores iguais.');
        setPlayerWon(false);
      } else if (pWins) {
        setResultMessage('Você venceu! +30 Pontos');
        setPlayerWon(true);
        stationsStore.addPoints(30);
        if (stationsStore.unlockTrunfoBadge) {
          stationsStore.unlockTrunfoBadge();
        }
      } else {
        setResultMessage('Você perdeu! A IA tinha o melhor valor.');
        setPlayerWon(false);
      }
    };

    const renderCard = (
      station: Station | null,
      isPlayer: boolean,
      hidden: boolean,
    ) => {
      if (!station) {
        return null;
      }

      const rating = getRating(station);

      if (hidden) {
        return (
          <Card style={[styles.card, styles.hiddenCard]}>
            <Icon
              name="question-mark-circle-outline"
              width={64}
              height={64}
              fill="#8F9BB3"
            />
            <Text style={{marginTop: 10, color: '#8F9BB3'}}>Carta Oculta</Text>
          </Card>
        );
      }

      return (
        <Card style={styles.card}>
          <Text category="h6" style={styles.stationName} numberOfLines={1}>
            {station.name}
          </Text>
          <Text appearance="hint" category="c1" style={styles.stationBrand}>
            {station.brand}
          </Text>

          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={[
                styles.statRow,
                selectedStat === 'gas' && styles.selectedStatRow,
              ]}
              disabled={!isPlayer || gamePhase !== 'playing'}
              onPress={() => handleStatSelect('gas')}>
              <Text category="s2">Gasolina:</Text>
              <Text category="s1">R$ {station.priceGas.toFixed(2)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statRow,
                selectedStat === 'ethanol' && styles.selectedStatRow,
              ]}
              disabled={!isPlayer || gamePhase !== 'playing'}
              onPress={() => handleStatSelect('ethanol')}>
              <Text category="s2">Etanol:</Text>
              <Text category="s1">R$ {station.priceEthanol.toFixed(2)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statRow,
                selectedStat === 'verifications' && styles.selectedStatRow,
              ]}
              disabled={!isPlayer || gamePhase !== 'playing'}
              onPress={() => handleStatSelect('verifications')}>
              <Text category="s2">Verificações:</Text>
              <Text category="s1">{station.verificationsCount || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statRow,
                selectedStat === 'rating' && styles.selectedStatRow,
              ]}
              disabled={!isPlayer || gamePhase !== 'playing'}
              onPress={() => handleStatSelect('rating')}>
              <Text category="s2">Avaliação:</Text>
              <Text category="s1">{rating.toFixed(1)} ⭐</Text>
            </TouchableOpacity>
          </View>
        </Card>
      );
    };

    if (!playerCard || !aiCard) {
      return (
        <RNModal
          visible={visible}
          transparent={true}
          animationType="fade"
          onRequestClose={onClose}>
          <View style={styles.backdrop}>
            <Card disabled={true} style={styles.modalContainer}>
              <Text>Não há postos suficientes para jogar.</Text>
              <Button onPress={onClose} style={{marginTop: 15}}>
                Fechar
              </Button>
            </Card>
          </View>
        </RNModal>
      );
    }

    return (
      <RNModal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Icon name="flash" width={28} height={28} fill="#FFD700" />
              <Text category="h5" style={styles.title}>
                Batalha de Postos
              </Text>
              <Icon name="flash" width={28} height={28} fill="#FFD700" />
            </View>

            {gamePhase === 'start' && (
              <View style={styles.centerContent}>
                <Text category="s1" style={styles.instructions}>
                  Bem-vindo ao Super Trunfo de Postos! Você receberá um posto e
                  a IA outro. Escolha a melhor característica do seu posto para
                  vencer (Menor Preço, ou Maior Verificações/Avaliação).
                </Text>
                <Button
                  size="giant"
                  onPress={startGame}
                  style={styles.actionBtn}>
                  JOGAR AGORA
                </Button>
              </View>
            )}

            {gamePhase !== 'start' && (
              <View style={styles.gameBoard}>
                <View style={styles.aiArea}>
                  <Text category="label" style={styles.areaLabel}>
                    IA
                  </Text>
                  {renderCard(aiCard, false, gamePhase === 'playing')}
                </View>

                {gamePhase === 'playing' && (
                  <View style={styles.vsBadge}>
                    <Text style={styles.vsText}>VS</Text>
                  </View>
                )}

                <View style={styles.playerArea}>
                  <Text category="label" style={styles.areaLabel}>
                    SUA CARTA
                  </Text>
                  {renderCard(playerCard, true, false)}
                  {gamePhase === 'playing' && (
                    <Text appearance="hint" style={styles.hintText}>
                      Toque em um atributo acima para duelar!
                    </Text>
                  )}
                </View>
              </View>
            )}

            {gamePhase === 'result' && (
              <View
                style={[
                  styles.resultBox,
                  playerWon ? styles.resultWon : styles.resultLost,
                ]}>
                <Text
                  category="h6"
                  style={[
                    styles.resultText,
                    playerWon ? styles.resultTextWon : styles.resultTextLost,
                  ]}>
                  {resultMessage}
                </Text>
                <Button
                  onPress={resetGame}
                  style={styles.actionBtn}
                  status={playerWon ? 'success' : 'basic'}>
                  JOGAR NOVAMENTE
                </Button>
              </View>
            )}

            <Button
              appearance="ghost"
              onPress={onClose}
              style={styles.closeBtn}>
              Fechar
            </Button>
          </View>
        </View>
      </RNModal>
    );
  },
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.95,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  title: {
    marginHorizontal: 10,
    fontWeight: 'bold',
  },
  centerContent: {
    padding: 20,
    alignItems: 'center',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  actionBtn: {
    borderRadius: 25,
    width: '80%',
    marginVertical: 10,
    alignSelf: 'center',
  },
  closeBtn: {
    marginTop: 10,
  },
  gameBoard: {
    alignItems: 'center',
  },
  aiArea: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerArea: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  areaLabel: {
    marginBottom: 5,
    color: '#8F9BB3',
    fontWeight: 'bold',
  },
  card: {
    width: width * 0.8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E4E9F2',
    backgroundColor: '#F7F9FC',
  },
  hiddenCard: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 180,
    backgroundColor: '#EDF1F7',
  },
  stationName: {
    fontWeight: 'bold',
  },
  stationBrand: {
    marginBottom: 10,
  },
  statsContainer: {
    marginTop: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
    borderRadius: 5,
  },
  selectedStatRow: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFD700',
    borderWidth: 1,
  },
  vsBadge: {
    backgroundColor: '#FF3D71',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '48%',
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  vsText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  hintText: {
    marginTop: 10,
    fontStyle: 'italic',
  },
  resultBox: {
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  resultWon: {
    backgroundColor: '#E5F9ED',
  },
  resultLost: {
    backgroundColor: '#FCE4EC',
  },
  resultText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  resultTextWon: {
    color: '#00E096',
    fontWeight: 'bold',
  },
  resultTextLost: {
    color: '#FF3D71',
    fontWeight: 'bold',
  },
});

export default BatalhaDePostosModal;
