import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {Card, Text, Icon, Button} from '@ui-kitten/components';
import {observer} from 'mobx-react';

const Caragotchi = observer(({stationsStore}: {stationsStore: any}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const {totalSavings} = stationsStore;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [bounceAnim]);

  let mood = 'Triste';
  let emoji = '😢';
  let color = '#8F9BB3';
  let message = 'Economize para me alimentar!';

  if (totalSavings > 100) {
    mood = 'Radiante';
    emoji = '🤩';
    color = '#FFD700';
    message = 'Você é incrível! Continuem economizando!';
  } else if (totalSavings > 50) {
    mood = 'Feliz';
    emoji = '😊';
    color = '#00E096';
    message = 'Estou bem alimentado! Bom trabalho!';
  } else if (totalSavings > 0) {
    mood = 'Contente';
    emoji = '🙂';
    color = '#3366FF';
    message = 'Obrigado pelo lanchinho!';
  }

  return (
    <Card style={[styles.card, {borderColor: color}]}>
      <View style={styles.header}>
        <View style={[styles.iconWrapper, {backgroundColor: `${color}15`}]}>
          <Icon
            name="smiling-face-outline"
            width={24}
            height={24}
            fill={color}
          />
        </View>
        <Text category="h6" style={[styles.title, {color}]}>
          Caragotchi
        </Text>
      </View>
      <View style={styles.content}>
        <Animated.Text
          style={[styles.emoji, {transform: [{translateY: bounceAnim}]}]}>
          {emoji}
        </Animated.Text>
        <View style={styles.info}>
          <Text category="s1" style={{fontWeight: 'bold'}}>
            Humor: {mood}
          </Text>
          <Text category="c1" appearance="hint" style={styles.message}>
            {message}
          </Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, {backgroundColor: `${color}30`}]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: color,
                width: `${Math.min(100, (totalSavings / 100) * 100)}%`,
              },
            ]}
          />
        </View>
        <Text category="c2" appearance="hint" style={styles.progressText}>
          Nível de Saciedade
        </Text>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    marginLeft: 10,
    fontWeight: 'bold',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginRight: 20,
  },
  info: {
    flex: 1,
  },
  message: {
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 15,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    marginTop: 5,
    textAlign: 'right',
  },
});

export default Caragotchi;
