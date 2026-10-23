import {secureRandom} from '../utils/random';
import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Modal as RNModal, useWindowDimensions, TouchableOpacity} from 'react-native';
import {Card, Text, Button, Icon} from '@ui-kitten/components';
import {observer} from 'mobx-react';
import StationsStore from '../stores/stations.store';

interface Props {
  visible: boolean;
  onClose: () => void;
  stationsStore: StationsStore;
}

const BINGO_EVENTS = [
  'Cachorro Caramelo',
  'Motoqueiro no corredor',
  'Fusca Azul',
  'Carro de Som',
  'Ambulância',
  'Caminhão do Gás',
  'Pneu Furado',
  'Blitz',
  'Gado na Pista',
  'Kombi Escolar',
  'Cavalo Solto',
  'Motorista Xingando',
  'Gato no Capô',
  'Buraco na Pista',
  'Vendedor Ambulante',
  'Moto Empinando'
];

const BingoDoTransitoModal = observer(({visible, onClose, stationsStore}: Props) => {
  const [grid, setGrid] = useState<{label: string; checked: boolean}[]>([]);
  const [claimed, setClaimed] = useState(false);
  const {width} = useWindowDimensions();

  useEffect(() => {
    if (visible) {
      // Pick 9 random unique events
      const shuffled = [...BINGO_EVENTS].sort(() => 0.5 - secureRandom());
      const selected = shuffled.slice(0, 9).map((label, index) => ({
        label: index === 4 ? 'FREE (Você)' : label,
        checked: index === 4,
      }));
      setGrid(selected);
      setClaimed(false);
    }
  }, [visible]);

  const toggleCell = (index: number) => {
    if (index === 4 || claimed) return;
    const newGrid = [...grid];
    newGrid[index].checked = !newGrid[index].checked;
    setGrid(newGrid);
    checkBingo(newGrid);
  };

  const checkBingo = (currentGrid: typeof grid) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    const hasBingo = lines.some(line =>
      line.every(index => currentGrid[index].checked)
    );

    if (hasBingo && !claimed) {
      stationsStore.addPoints(200);
      if (stationsStore.unlockBingoBadge) {
        stationsStore.unlockBingoBadge();
      }
      setClaimed(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Card disabled={true} style={[styles.modalCard, {width: width * 0.9}]}>
          <View style={styles.header}>
            <Icon name="grid-outline" width={32} height={32} fill="#FFD700" />
            <Text category="h4" style={styles.title}>
              Bingo do Trânsito!
            </Text>
            <Icon name="grid-outline" width={32} height={32} fill="#FFD700" />
          </View>

          <Text category="s1" style={styles.subtitle}>
            Marque os eventos que você viu hoje no trânsito. Complete uma linha, coluna ou diagonal para ganhar 200 pontos!
          </Text>

          {!claimed ? (
            <View style={styles.gridContainer}>
              {grid.map((cell, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.cell,
                    cell.checked ? styles.cellChecked : null,
                  ]}
                  onPress={() => toggleCell(index)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.cellText,
                    cell.checked ? styles.cellTextChecked : null
                  ]}>
                    {cell.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.successBox}>
              <Icon
                name="checkmark-circle-2"
                width={64}
                height={64}
                fill="#00E096"
              />
              <Text category="h3" style={styles.successText}>
                BINGO!
              </Text>
              <Text category="s1" style={{textAlign: 'center', marginTop: 10}}>
                +200 Pontos e Badge Resgatados!
              </Text>
            </View>
          )}

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
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    borderRadius: 20,
    padding: 20,
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
    color: '#3366FF',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#8F9BB3',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cell: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#F7F9FC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E9F2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    marginBottom: '3%',
  },
  cellChecked: {
    backgroundColor: '#3366FF',
    borderColor: '#3366FF',
  },
  cellText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#222B45',
    fontWeight: 'bold',
  },
  cellTextChecked: {
    color: '#FFFFFF',
  },
  successBox: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 15,
  },
  successText: {
    color: '#00E096',
    marginTop: 10,
    fontWeight: 'bold',
  },
  closeButton: {
    borderRadius: 30,
  },
});

export default BingoDoTransitoModal;
