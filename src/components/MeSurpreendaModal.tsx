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

const SURPRISES = [
  'Atenção: A NASA ligou, eles querem saber qual posto você usa para abastecer o foguete.',
  'Recomendação do dia: Use patinete elétrico se a gasolina passar de 6 reais.',
  'Seu carro está secretamente sonhando em ser movido a água.',
  'Dica de ouro: Economize combustível dirigindo apenas em ladeiras abaixo.',
  'Descobrimos um posto que aceita abraços como pagamento. Mentira, continue economizando!',
  'Hoje seu nível de economia está tão alto que o Tio Patinhas pediu dicas.',
  'Seu posto de gasolina favorito quer te eleger cliente do ano!',
  'O cheiro da gasolina não é perfume, use com moderação.',
  'Se o seu carro falasse, ele pediria para você usar as pernas hoje.',
];

const TRIVIA = [
  {
    question: 'Qual é o nome do primeiro carro produzido em série?',
    options: ['Ford T', 'Fusca', 'Fiat 147', 'Kombi'],
    answer: 'Ford T',
  },
  {
    question: 'De onde vem a gasolina?',
    options: ['Milho', 'Petróleo', 'Cana-de-açúcar', 'Água'],
    answer: 'Petróleo',
  },
  {
    question: 'Qual país inventou o carro movido a etanol?',
    options: ['Brasil', 'EUA', 'Alemanha', 'Japão'],
    answer: 'Brasil',
  },
  {
    question: 'Qual o significado da sigla RPM no painel do carro?',
    options: [
      'Rodas Por Minuto',
      'Rotações Por Minuto',
      'Retas Por Milha',
      'Rendimento Por Motor',
    ],
    answer: 'Rotações Por Minuto',
  },
  {
    question: 'A gasolina é mais densa ou menos densa que a água?',
    options: ['Mais densa', 'Menos densa', 'Mesma densidade', 'Varia'],
    answer: 'Menos densa',
  },
  {
    question: 'Qual foi o primeiro animal a viajar em um carro?',
    options: ['Cachorro', 'Gato', 'Macaco', 'Pato'],
    answer: 'Cachorro',
  },
];

const MeSurpreendaModal = observer(
  ({visible, onClose, stationsStore}: Props) => {
    const [mode, setMode] = useState<'surprise' | 'trivia'>('surprise');
    const [surprise, setSurprise] = useState('');
    const [triviaItem, setTriviaItem] = useState<{
      question: string;
      options: string[];
      answer: string;
    } | null>(null);
    const [claimed, setClaimed] = useState(false);
    const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(
      null,
    );

    useEffect(() => {
      if (visible) {
        const isTrivia = secureRandom() > 0.5;
        setMode(isTrivia ? 'trivia' : 'surprise');

        if (isTrivia) {
          setTriviaItem(TRIVIA[Math.floor(secureRandom() * TRIVIA.length)]);
        } else {
          setSurprise(SURPRISES[Math.floor(secureRandom() * SURPRISES.length)]);
        }

        setClaimed(false);
        setAnsweredCorrectly(null);
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

    const handleAnswer = (option: string) => {
      if (triviaItem && option === triviaItem.answer) {
        setAnsweredCorrectly(true);
        stationsStore.addPoints(150); // Trivia gets more points
        if (stationsStore.unlockSurpresaBadge) {
          stationsStore.unlockSurpresaBadge();
        }
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        setAnsweredCorrectly(false);
        setTimeout(() => {
          onClose();
        }, 2500);
      }
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

            {mode === 'surprise' ? (
              <>
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
                    accessoryLeft={(p) => <Icon {...p} name="star-outline" />}>
                    RESGATAR 100 PONTOS!
                  </Button>
                ) : (
                  <View style={styles.successBox}>
                    <Icon
                      name="checkmark-circle-2"
                      width={48}
                      height={48}
                      fill="#00E096"
                    />
                    <Text category="h6" style={styles.successText}>
                      Pontos e Badge Resgatados!
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <View style={styles.messageBox}>
                  <Text category="s1" style={styles.messageText}>
                    {triviaItem?.question}
                  </Text>
                </View>

                {answeredCorrectly === null ? (
                  <View style={styles.optionsContainer}>
                    {triviaItem?.options.map((option, idx) => (
                      <Button
                        key={idx}
                        style={styles.optionButton}
                        appearance="outline"
                        status="primary"
                        onPress={() => handleAnswer(option)}>
                        {option}
                      </Button>
                    ))}
                  </View>
                ) : answeredCorrectly ? (
                  <View style={styles.successBox}>
                    <Icon
                      name="checkmark-circle-2"
                      width={48}
                      height={48}
                      fill="#00E096"
                    />
                    <Text category="h6" style={styles.successText}>
                      Correto! +150 Pontos!
                    </Text>
                  </View>
                ) : (
                  <View style={styles.successBox}>
                    <Icon
                      name="close-circle"
                      width={48}
                      height={48}
                      fill="#FF3D71"
                    />
                    <Text
                      category="h6"
                      style={[styles.successText, {color: '#FF3D71'}]}>
                      Errado! A resposta era: {triviaItem?.answer}
                    </Text>
                  </View>
                )}
              </>
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
  optionsContainer: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  optionButton: {
    marginBottom: 8,
  },
  closeButton: {
    borderRadius: 30,
  },
});

export default MeSurpreendaModal;
