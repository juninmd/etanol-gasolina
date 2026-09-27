import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Modal as RNModal,
  Dimensions,
  ScrollView,
} from 'react-native';
import {Text, Button, Icon, Input, CheckBox} from '@ui-kitten/components';
import {observer} from 'mobx-react';
import StationsStore from '../stores/stations.store';

const {width, height} = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  stationsStore: StationsStore;
}

const CalculadoraDeRoleModal = observer(
  ({visible, onClose, stationsStore}: Props) => {
    const [distance, setDistance] = useState('');
    const [consumption, setConsumption] = useState('');
    const [price, setPrice] = useState('');
    const [passengers, setPassengers] = useState('2');

    const [taxaAr, setTaxaAr] = useState(false);
    const [taxaDJ, setTaxaDJ] = useState(false);
    const [taxaAtraso, setTaxaAtraso] = useState(false);

    const [result, setResult] = useState<{
      total: number;
      perPerson: number;
      messages: string[];
    } | null>(null);

    useEffect(() => {
      if (visible) {
        setDistance('');
        setConsumption('10');
        setPrice('');
        setPassengers('2');
        setTaxaAr(false);
        setTaxaDJ(false);
        setTaxaAtraso(false);
        setResult(null);
      }
    }, [visible]);

    const calculate = () => {
      const d = parseFloat(distance) || 0;
      const c = parseFloat(consumption) || 1;
      const p = parseFloat(price.replace(',', '.')) || 0;
      const pax = parseInt(passengers, 10) || 1;

      if (d <= 0 || p <= 0) {
        alert('Preencha distância e preço do combustível corretamente!');
        return;
      }

      const baseCost = (d / c) * p;
      let extra = 0;
      const messages = [];

      if (taxaAr) {
        extra += baseCost * 0.1;
        messages.push('🥶 Taxa do Ar Condicionado (10%)');
      }
      if (taxaDJ) {
        extra += 5;
        messages.push('🎵 Taxa do DJ Ruim (R$ 5)');
      }
      if (taxaAtraso) {
        extra += 10;
        messages.push('⏰ Multa por Atraso (R$ 10)');
      }

      const total = baseCost + extra;
      const perPerson = total / pax;

      setResult({
        total,
        perPerson,
        messages,
      });

      stationsStore.addPoints(50);
      // @ts-ignore - will be implemented in store
      if (stationsStore.unlockReiDoRoleBadge) {
        // @ts-ignore
        stationsStore.unlockReiDoRoleBadge();
      }
    };

    return (
      <RNModal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.header}>
                <Icon
                  name="people-outline"
                  width={32}
                  height={32}
                  fill="#3366FF"
                />
                <Text category="h5" style={styles.title}>
                  Calculadora de Rolê
                </Text>
              </View>
              <Text style={styles.subtitle}>
                Racha a gasolina sem perder a amizade!
              </Text>

              {!result ? (
                <>
                  <View style={styles.inputContainer}>
                    <Input
                      label="Distância Total (km)"
                      placeholder="Ex: 50"
                      value={distance}
                      onChangeText={setDistance}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    <Input
                      label="Consumo (km/l)"
                      placeholder="Ex: 10"
                      value={consumption}
                      onChangeText={setConsumption}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    <Input
                      label="Preço Combustível (R$)"
                      placeholder="Ex: 5.50"
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    <Input
                      label="Quantos pagantes?"
                      placeholder="Ex: 4"
                      value={passengers}
                      onChangeText={setPassengers}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.taxesContainer}>
                    <Text category="s1" style={{marginBottom: 10}}>
                      Taxas Opcionais da Amizade:
                    </Text>
                    <CheckBox
                      checked={taxaAr}
                      onChange={(nextChecked) => setTaxaAr(nextChecked)}
                      style={styles.checkbox}>
                      Taxa do Ar Gelado (+10%)
                    </CheckBox>
                    <CheckBox
                      checked={taxaDJ}
                      onChange={(nextChecked) => setTaxaDJ(nextChecked)}
                      style={styles.checkbox}>
                      Taxa do DJ Ruim (+R$ 5)
                    </CheckBox>
                    <CheckBox
                      checked={taxaAtraso}
                      onChange={(nextChecked) => setTaxaAtraso(nextChecked)}
                      style={styles.checkbox}>
                      Multa do Atrasildo (+R$ 10)
                    </CheckBox>
                  </View>

                  <Button
                    size="large"
                    status="primary"
                    onPress={calculate}
                    style={styles.calculateButton}>
                    CALCULAR RACHA
                  </Button>
                </>
              ) : (
                <View style={styles.resultContainer}>
                  <Text category="h6" style={styles.resultTitle}>
                    O Veredito
                  </Text>

                  <View style={styles.resultBox}>
                    <Text style={styles.resultLabel}>Custo Total</Text>
                    <Text style={styles.resultTotal}>
                      R$ {result.total.toFixed(2)}
                    </Text>
                  </View>

                  <View
                    style={[styles.resultBox, {backgroundColor: '#3366FF'}]}>
                    <Text style={[styles.resultLabel, {color: 'white'}]}>
                      Para Cada Um
                    </Text>
                    <Text
                      style={[
                        styles.resultTotal,
                        {color: 'white', fontSize: 36},
                      ]}>
                      R$ {result.perPerson.toFixed(2)}
                    </Text>
                  </View>

                  {result.messages.length > 0 && (
                    <View style={styles.messagesBox}>
                      <Text category="s2" style={{marginBottom: 5}}>
                        Inclui:
                      </Text>
                      {result.messages.map((m, i) => (
                        <Text key={i} style={styles.messageText}>
                          {m}
                        </Text>
                      ))}
                    </View>
                  )}

                  <View style={styles.badgeAlert}>
                    <Icon name="star" width={24} height={24} fill="#FFD700" />
                    <Text style={styles.badgeText}>
                      +50 pts. Em busca da badge Rei do Rolê!
                    </Text>
                  </View>
                </View>
              )}

              <Button
                appearance="ghost"
                status="basic"
                style={styles.closeButton}
                onPress={onClose}>
                {result ? 'Voltar para Home' : 'Cancelar'}
              </Button>
            </ScrollView>
          </View>
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
    maxHeight: height * 0.85,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  title: {
    marginHorizontal: 10,
    fontWeight: 'bold',
    color: '#3366FF',
  },
  subtitle: {
    textAlign: 'center',
    color: '#8F9BB3',
    marginBottom: 20,
  },
  inputContainer: {
    gap: 15,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F7F9FC',
  },
  taxesContainer: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#F0F4FF',
    borderRadius: 10,
  },
  checkbox: {
    marginVertical: 5,
  },
  calculateButton: {
    borderRadius: 15,
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 10,
    borderRadius: 30,
  },
  resultContainer: {
    alignItems: 'center',
    width: '100%',
  },
  resultTitle: {
    marginBottom: 20,
    fontWeight: 'bold',
  },
  resultBox: {
    width: '100%',
    backgroundColor: '#F7F9FC',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  resultLabel: {
    fontSize: 16,
    color: '#8F9BB3',
    marginBottom: 5,
  },
  resultTotal: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222B45',
  },
  messagesBox: {
    width: '100%',
    padding: 15,
    backgroundColor: '#FFFBE6',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE066',
  },
  messageText: {
    color: '#B8860B',
    marginVertical: 2,
  },
  badgeAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeText: {
    color: '#2E7D32',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default CalculadoraDeRoleModal;
