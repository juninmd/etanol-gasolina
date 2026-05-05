import React, {useState, useEffect} from 'react';
import {StyleSheet, View, ScrollView, Animated} from 'react-native';
import {Modal, Card, Text, Button, Icon} from '@ui-kitten/components';
import StationsStore from '../stores/stations.store';

interface Props {
  visible: boolean;
  onClose: () => void;
  stationsStore: StationsStore;
}

const ITEMS = [
  {id: 'picanha', name: 'Kg de Picanha', price: 80, icon: 'sun-outline', color: '#FF3D71'},
  {id: 'cerveja', name: 'Fardo de Cerveja', price: 40, icon: 'droplet-outline', color: '#FFD700'},
  {id: 'carvao', name: 'Saco de Carvão', price: 20, icon: 'cube-outline', color: '#8F9BB3'},
  {id: 'pao_alho', name: 'Pão de Alho', price: 15, icon: 'star-outline', color: '#00E096'},
];

const ChurrascometroModal = ({visible, onClose, stationsStore}: Props) => {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Reward the user for discovering the easter egg
      const badge = stationsStore.badges.find(b => b.id === 'churrasqueiro');
      if (badge && !badge.unlocked) {
        badge.unlocked = true;
        stationsStore.badgeQueue.push(badge);
        stationsStore.addPoints(50);
      }

      Animated.spring(animation, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      animation.setValue(0);
    }
  }, [visible, animation, stationsStore]);

  const savings = stationsStore.totalSavings || 0;

  const calculateItems = () => {
    if (savings <= 0) return [];

    const items = [];
    let remaining = savings;

    for (const item of ITEMS) {
      const quantity = Math.floor(remaining / item.price);
      if (quantity > 0) {
        items.push({...item, quantity});
        remaining -= quantity * item.price;
      }
    }

    return items;
  };

  const affordableItems = calculateItems();

  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={onClose}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              {
                scale: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
            opacity: animation,
          },
        ]}>
        <Card disabled={true} style={styles.card}>
          <View style={styles.header}>
            <Text category="h4" style={styles.title}>
              🔥 Churrascómetro
            </Text>
            <Text category="s1" style={styles.subtitle}>
              O que sua economia compra no churrasco?
            </Text>
          </View>

          <View style={styles.savingsBox}>
            <Text category="p2" style={styles.savingsLabel}>
              Total Economizado
            </Text>
            <Text category="h2" style={styles.savingsValue}>
              R$ {savings.toFixed(2)}
            </Text>
          </View>

          <ScrollView style={styles.itemsList}>
            {savings === 0 ? (
              <View style={styles.emptyState}>
                <Icon
                  name="alert-circle-outline"
                  width={48}
                  height={48}
                  fill="#8F9BB3"
                />
                <Text category="s1" style={styles.emptyText}>
                  Você ainda não registrou economias. Calcule e economize para
                  garantir o churrasco!
                </Text>
              </View>
            ) : affordableItems.length > 0 ? (
              affordableItems.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={[styles.iconBox, {backgroundColor: item.color}]}>
                    <Icon name={item.icon} width={24} height={24} fill="white" />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text category="s1" style={styles.itemName}>
                      {item.quantity}x {item.name}
                    </Text>
                    <Text category="p2" style={styles.itemPrice}>
                      (R$ {item.price}/un)
                    </Text>
                  </View>
                  <Text category="h6" style={styles.itemTotal}>
                    R$ {(item.quantity * item.price).toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Icon
                  name="clock-outline"
                  width={48}
                  height={48}
                  fill="#FFD700"
                />
                <Text category="s1" style={styles.emptyText}>
                  Falta pouco! Economize mais um pouquinho para garantir pelo
                  menos o Pão de Alho.
                </Text>
              </View>
            )}
          </ScrollView>

          <Button style={styles.button} onPress={onClose} status="danger">
            Bora Economizar Mais!
          </Button>
        </Card>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    width: 340,
    maxWidth: '90%',
  },
  card: {
    borderRadius: 20,
    padding: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    color: '#FF3D71',
  },
  subtitle: {
    color: '#8F9BB3',
    textAlign: 'center',
    marginTop: 5,
  },
  savingsBox: {
    backgroundColor: '#E5F9F1',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00E096',
  },
  savingsLabel: {
    color: '#00E096',
    fontWeight: 'bold',
  },
  savingsValue: {
    color: '#00E096',
    fontWeight: 'bold',
  },
  itemsList: {
    maxHeight: 250,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: 'bold',
  },
  itemPrice: {
    color: '#8F9BB3',
  },
  itemTotal: {
    fontWeight: 'bold',
    color: '#222B45',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8F9BB3',
    marginTop: 10,
  },
  button: {
    borderRadius: 12,
  },
});

export default ChurrascometroModal;
