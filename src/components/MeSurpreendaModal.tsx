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

const SURPRISES = [
  'Atenção: A NASA ligou, eles querem saber qual posto você usa para abastecer o foguete.',
  'Recomendação do dia: Use patinete elétrico se a gasolina passar de 6 reais.',
  'Seu carro está secretamente sonhando em ser movido a água.',
  'Dica de ouro: Economize combustível dirigindo apenas em ladeiras abaixo.',
  'Descobrimos um posto que aceita abraços como pagamento. Mentira, continue economizando!',
  'Hoje seu nível de economia está tão alto que o Tio Patinhas pediu dicas.',
];

const secureRandom = () => {
  let r = 0;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    r = array[0] / (0xffffffff + 1);
  } else {
    const now = Date.now();
    r = ((now * 9301 + 49297) % 233280) / 233280;
  }
  return r;
};

const MeSurpreendaModal = observer(({visible, onClose, stationsStore}: Props) => {
  const [surprise, setSurprise] = useState('');
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (visible) {
      setSurprise(SURPRISES[Math.floor(secureRandom() * SURPRISES.length)]);
      setClaimed(false);
    }
  }, [visible]);

  const handleClaim = () => {
    stationsStore.addPoints(100);
    if (stationsStore.unlockSurpresaBadge) {
      stationsStore.unlockSurpresaBadge();
    }
    setClaimed(true);
    setTimeout(() => {
      onClose();
    }, 2000);
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
            <Icon name="gift-outline" width={32} height={32} fill="#FFD700" />
            <Text category="h4" style={styles.title}>
              Surpresa!
            </Text>
            <Icon name="gift-outline" width={32} height={32} fill="#FFD700" />
          </View>

          <View style={styles.messageBox}>
            <Text category="s1" style={styles.messageText}>
              {surprise}
            </Text>
          </View>

          {!claimed ? (
            <Button
              size="giant"
              status="success"
              onPress={handleClaim}
              style={styles.claimButton}
              accessoryLeft={p => <Icon {...p} name="star-outline" />}>
              RESGATAR 100 PONTOS!
            </Button>
          ) : (
            <View style={styles.successBox}>
              <Icon name="checkmark-circle-2" width={48} height={48} fill="#00E096" />
              <Text category="h6" style={styles.successText}>
                Pontos e Badge Resgatados!
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
    color: '#3366FF',
  },
  messageBox: {
    padding: 20,
    backgroundColor: '#F0F4FF',
    borderRadius: 15,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#3366FF',
  },
  messageText: {
    textAlign: 'center',
    fontSize: 18,
    fontStyle: 'italic',
    color: '#222B45',
  },
  claimButton: {
    borderRadius: 30,
    marginBottom: 15,
  },
  successBox: {
    alignItems: 'center',
    padding: 15,
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

export default MeSurpreendaModal;
