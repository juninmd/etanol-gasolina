import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Modal as RNModal,
  Animated,
} from 'react-native';
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

const PHRASES = [
  {
    text: 'A água do radiador tá baixando, quer completar com o aditivo de R$ 90?',
    trap: true,
    explanation:
      'Geralmente só precisa de água desmineralizada e aditivo específico na proporção correta. Não compre de galão duvidoso no posto!',
  },
  {
    text: 'O óleo tá baixo, patrão. Posso colocar um litro a mais?',
    trap: true,
    explanation:
      'Meça o óleo apenas com o motor frio e em local plano. Em postos, o óleo quente ainda não desceu pro cárter e marca baixo falsamente.',
  },
  {
    text: 'O combustível aditivado vai limpar seu motor todinho, vale a pena!',
    trap: true,
    explanation:
      'Aditivada tem detergentes, mas não faz milagres se o motor já estiver sujo. E a gasolina comum já cumpre seu papel.',
  },
  {
    text: 'Posso jogar uma aguinha no vidro pra dar um talento?',
    trap: false,
    explanation:
      'Isso é cortesia! Mas fique de olho se ele não vai tentar te vender palhetas novas no processo.',
  },
  {
    text: 'Sua palheta tá ressecada, vai riscar o vidro. Tenho uma original aqui na promoção.',
    trap: true,
    explanation:
      'Palhetas de posto costumam ser muito mais caras. Compre em lojas de autopeças ou online por uma fração do preço.',
  },
  {
    text: 'Vou calibrar os pneus pra você. Quer colocar nitrogênio por R$ 20? Roda mais liso.',
    trap: true,
    explanation:
      'Nitrogênio ajuda a não variar a pressão com a temperatura, mas ar comum (que já é 78% nitrogênio) calibra perfeitamente de graça.',
  },
];

const DetectorMentirasModal = observer(
  ({visible, onClose, stationsStore}: Props) => {
    const [step, setStep] = useState<'intro' | 'analyzing' | 'result'>('intro');
    const [selectedPhrase, setSelectedPhrase] = useState(PHRASES[0]);
    const [scale] = useState(new Animated.Value(1));
    const [analyzingDot, setAnalyzingDot] = useState('');

    useEffect(() => {
      if (visible) {
        setStep('intro');
        setSelectedPhrase(PHRASES[Math.floor(secureRandom() * PHRASES.length)]);

        // Unlock badge when they open the feature
        if (stationsStore.unlockDetectorBadge) {
          stationsStore.unlockDetectorBadge();
        }
      }
    }, [visible, stationsStore]);

    useEffect(() => {
      let interval: NodeJS.Timeout;
      if (step === 'analyzing') {
        let dots = 0;
        interval = setInterval(() => {
          dots = (dots + 1) % 4;
          setAnalyzingDot('.'.repeat(dots));
        }, 500);

        const timeout = setTimeout(() => {
          setStep('result');
        }, 3000);

        return () => {
          clearInterval(interval);
          clearTimeout(timeout);
        };
      }
      return () => {};
    }, [step]);

    const startAnalysis = () => {
      setStep('analyzing');
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return (
      <RNModal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <Card disabled={true} style={styles.modalCard}>
            <View style={styles.header}>
              <Icon
                name="alert-triangle-outline"
                width={32}
                height={32}
                fill="#FFAA00"
              />
              <Text category="h4" style={styles.title}>
                Detector de Cilada
              </Text>
            </View>

            {step === 'intro' && (
              <View style={styles.contentBox}>
                <Text category="s1" style={styles.subtitle}>
                  O frentista acabou de te falar:
                </Text>
                <View style={styles.phraseBox}>
                  <Text category="h6" style={styles.phraseText}>
                    "{selectedPhrase.text}"
                  </Text>
                </View>
                <Button
                  status="warning"
                  style={styles.button}
                  onPress={startAnalysis}>
                  ANALISAR A MENTIRA
                </Button>
              </View>
            )}

            {step === 'analyzing' && (
              <View style={styles.contentBox}>
                <Animated.View style={{transform: [{scale}]}}>
                  <Icon
                    name="activity-outline"
                    width={64}
                    height={64}
                    fill="#3366FF"
                  />
                </Animated.View>
                <Text category="h5" style={styles.analyzingText}>
                  Processando com IA super avançada{analyzingDot}
                </Text>
              </View>
            )}

            {step === 'result' && (
              <View style={styles.contentBox}>
                {selectedPhrase.trap ? (
                  <View style={styles.resultBox}>
                    <Icon
                      name="close-circle"
                      width={64}
                      height={64}
                      fill="#FF3D71"
                    />
                    <Text
                      category="h2"
                      style={[styles.resultTitle, {color: '#FF3D71'}]}>
                      CILADA!
                    </Text>
                  </View>
                ) : (
                  <View style={styles.resultBox}>
                    <Icon
                      name="checkmark-circle-2"
                      width={64}
                      height={64}
                      fill="#00E096"
                    />
                    <Text
                      category="h2"
                      style={[styles.resultTitle, {color: '#00E096'}]}>
                      DE BOA!
                    </Text>
                  </View>
                )}

                <Text category="s1" style={styles.explanationText}>
                  {selectedPhrase.explanation}
                </Text>

                <Button
                  appearance="outline"
                  status="basic"
                  style={styles.closeButton}
                  onPress={onClose}>
                  Tô Safo! (Fechar)
                </Button>
              </View>
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
    color: '#FFAA00',
  },
  contentBox: {
    alignItems: 'center',
  },
  subtitle: {
    color: '#8F9BB3',
    marginBottom: 10,
  },
  phraseBox: {
    padding: 20,
    backgroundColor: '#FFF5E5',
    borderRadius: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#FFAA00',
    width: '100%',
  },
  phraseText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#222B45',
  },
  button: {
    width: '100%',
    borderRadius: 30,
  },
  analyzingText: {
    marginTop: 20,
    color: '#3366FF',
    textAlign: 'center',
  },
  resultBox: {
    alignItems: 'center',
    marginBottom: 15,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  explanationText: {
    textAlign: 'center',
    color: '#222B45',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  closeButton: {
    width: '100%',
    borderRadius: 30,
  },
});

export default DetectorMentirasModal;
