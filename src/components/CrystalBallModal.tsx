import {secureRandom} from '../utils/random';
import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Modal as RNModal, Dimensions} from 'react-native';
import {Card, Text, Button, Icon} from '@ui-kitten/components';
import {observer} from 'mobx-react';
import StationsStore from '../stores/stations.store';

const {width} = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  stationsStore: StationsStore;
}

const PREDICTIONS = [
  'Vejo em sua aura que amanhã o etanol estará mais barato, ou talvez eu tenha apenas visto as notícias...',
  'Os astros dizem que você deve abastecer antes do fim de semana, a energia cósmica afeta o mercado.',
  'Sinto uma forte presença... de promoções no seu posto favorito.',
  'Minha visão astral diz: "Não confie no posto da esquina hoje".',
  'Os espíritos antigos sussurram: O preço vai subir. Ou vai descer. As vozes estão confusas hoje.',
  'Um futuro brilhante lhe aguarda... se você trocar o óleo do seu carro.',
  'Vejo... vejo você andando a pé porque esqueceu de abastecer!',
];

const CrystalBallModal = observer(
  ({visible, onClose, stationsStore}: Props) => {
    const [prediction, setPrediction] = useState('');
    const [isConsulting, setIsConsulting] = useState(false);
    const [claimed, setClaimed] = useState(false);

    useEffect(() => {
      if (visible) {
        setPrediction('');
        setClaimed(false);
        setIsConsulting(false);
      }
    }, [visible]);

    const handleConsult = () => {
      setIsConsulting(true);
      setTimeout(() => {
        setPrediction(
          PREDICTIONS[Math.floor(secureRandom() * PREDICTIONS.length)],
        );
        setIsConsulting(false);

        stationsStore.addPoints(50);
        if (stationsStore.unlockVidenteBadge) {
          stationsStore.unlockVidenteBadge();
        }
        setClaimed(true);
      }, 1500);
    };

    return (
      <RNModal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <Card disabled={true} style={styles.modalCard}>
            <View style={styles.header}>
              <Icon
                name="globe-outline"
                width={32}
                height={32}
                fill="#9C27B0"
              />
              <Text category="h4" style={styles.title}>
                Bola de Cristal
              </Text>
              <Icon
                name="globe-outline"
                width={32}
                height={32}
                fill="#9C27B0"
              />
            </View>

            <View
              style={[styles.messageBox, claimed && styles.messageBoxClaimed]}>
              <Text category="s1" style={styles.messageText}>
                {isConsulting
                  ? 'Consultando os astros... 🔮'
                  : prediction ||
                    'Quer saber o futuro dos preços dos combustíveis?'}
              </Text>
            </View>

            {!prediction && !isConsulting && (
              <Button
                size="large"
                style={styles.consultButton}
                onPress={handleConsult}
                accessoryLeft={(p) => <Icon {...p} name="eye-outline" />}>
                Consultar
              </Button>
            )}

            {claimed && (
              <View style={styles.successBox}>
                <Icon
                  name="checkmark-circle-2"
                  width={40}
                  height={40}
                  fill="#00E096"
                />
                <Text category="h6" style={styles.successText}>
                  Badge de Vidente e 50 Pontos!
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
    color: '#9C27B0',
  },
  messageBox: {
    padding: 20,
    backgroundColor: '#F3E5F5',
    borderRadius: 15,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#9C27B0',
  },
  messageBoxClaimed: {
    borderColor: '#00E096',
    backgroundColor: '#E5F9F1',
  },
  messageText: {
    textAlign: 'center',
    fontSize: 18,
    fontStyle: 'italic',
    color: '#4A148C',
  },
  consultButton: {
    borderRadius: 30,
    marginBottom: 15,
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  successBox: {
    alignItems: 'center',
    padding: 10,
    marginBottom: 15,
  },
  successText: {
    color: '#00E096',
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    borderRadius: 30,
  },
});

export default CrystalBallModal;
