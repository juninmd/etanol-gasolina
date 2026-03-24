import React from 'react';
import {StyleSheet, View, Modal as RNModal, Dimensions} from 'react-native';
import {Card, Text, Button, Icon} from '@ui-kitten/components';
import {observer} from 'mobx-react';

const {width} = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  stationsStore: StationsStore;
}

const FuelWrappedModal = observer(
  ({visible, onClose, stationsStore}: Props) => {
    const {totalSavings, treesPlanted, badges} = stationsStore;
    const pizzas = Math.floor(totalSavings / 50);
    const coffees = Math.floor(totalSavings / 10);
    const unlockedBadgesCount = badges.filter((b: any) => b.unlocked).length;

    return (
      <RNModal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <Card disabled={true} style={styles.modalCard}>
            <View style={styles.header}>
              <Icon name="star" width={32} height={32} fill="#FFD700" />
              <Text category="h5" style={styles.title}>
                Sua Retrospectiva
              </Text>
            </View>

            <Text category="s1" appearance="hint" style={styles.subtitle}>
              Olha o quanto você já brilhou usando o app!
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text category="h4" status="success">
                  R$ {totalSavings.toFixed(2)}
                </Text>
                <Text category="c1" appearance="hint">
                  Economizados
                </Text>
              </View>

              <View style={styles.row}>
                <View style={[styles.statBox, styles.halfBox]}>
                  <Text category="h4">{pizzas} 🍕</Text>
                  <Text category="c1" appearance="hint">
                    Pizzas ganhas
                  </Text>
                </View>
                <View style={[styles.statBox, styles.halfBox]}>
                  <Text category="h4">{coffees} ☕</Text>
                  <Text category="c1" appearance="hint">
                    Cafés garantidos
                  </Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.statBox, styles.halfBox]}>
                  <Text category="h4" status="success">
                    {treesPlanted} 🌳
                  </Text>
                  <Text category="c1" appearance="hint">
                    Árvores salvas
                  </Text>
                </View>
                <View style={[styles.statBox, styles.halfBox]}>
                  <Text category="h4" status="info">
                    {unlockedBadgesCount} 🏅
                  </Text>
                  <Text category="c1" appearance="hint">
                    Conquistas
                  </Text>
                </View>
              </View>
            </View>

            <Button
              status="primary"
              style={styles.closeButton}
              onPress={onClose}>
              Incrível! Fechar
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
    marginLeft: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    gap: 15,
  },
  statBox: {
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDF1F7',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfBox: {
    flex: 1,
  },
  closeButton: {
    marginTop: 20,
    borderRadius: 30,
  },
});

export default FuelWrappedModal;
