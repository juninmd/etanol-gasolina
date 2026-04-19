import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, ScrollView, Animated, Dimensions} from 'react-native';
import {Modal, Card, Text, Button, Icon, Layout, Input} from '@ui-kitten/components';
import {observer} from 'mobx-react';
import StationsStore from '../stores/stations.store';

const {width, height} = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  stationsStore: StationsStore;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  options?: string[];
}

const AICopilotModal = observer(({visible, onClose, stationsStore}: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      // Initial greeting
      setMessages([
        {
          id: Date.now().toString(),
          text: `Olá! Sou seu Copiloto de Economia 🤖. Notei que você já economizou R$ ${stationsStore.totalSavings.toFixed(2)}. Como posso surpreender você hoje?`,
          sender: 'ai',
          options: ['Dica do dia', 'Previsão de preços', 'Desafio maluco'],
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [visible, stationsStore.totalSavings]);

  const handleOptionSelect = (option: string) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: option,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate AI thinking and replying
    setTimeout(() => {
      let aiResponse = '';
      let newOptions: string[] = [];

      if (option === 'Dica do dia') {
        const bestFuel = stationsStore.marketAnalysis.bestFuel === 'Ethanol' ? 'Etanol' : 'Gasolina';
        aiResponse = `A dica de ouro de hoje: O mercado está favorável para ${bestFuel}. Mantenha os pneus calibrados e você pode economizar até 3% a mais!`;
        newOptions = ['Obrigado!', 'Previsão de preços'];
      } else if (option === 'Previsão de preços') {
        const trend = stationsStore.globalMarketAdvice;
        aiResponse = `Minha análise de dados indica: ${trend}. Que tal abastecer agora e garantir o preço?`;
        newOptions = ['Ver mapa', 'Desafio maluco'];
      } else if (option === 'Desafio maluco') {
        aiResponse = 'Desafio aceito! Tente andar de bicicleta amanhã. Economia de 100% e as pernas agradecem! 🚲💨 Aceita?';
        newOptions = ['Aceito!', 'Nem pensar'];
      } else if (option === 'Aceito!') {
        aiResponse = 'Incrível! Ganhou 50 pontos virtuais de coragem ambiental. 🌳';
        stationsStore.addPoints(50);
      } else if (option === 'Ver mapa') {
        aiResponse = 'Feche este chat e olhe o mapa na tela principal. Encontrei ótimos preços por lá.';
      } else {
        aiResponse = 'Estou sempre aprendendo. Continue economizando!';
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        options: newOptions.length > 0 ? newOptions : undefined,
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  if (!visible) {return null;}

  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={onClose}>
      <Card disabled={true} style={styles.modalCard}>
        <View style={styles.header}>
          <Icon name="message-circle-outline" width={24} height={24} fill="#00E096" />
          <Text category="h6" style={{marginLeft: 10}}>AI Copilot</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={{paddingBottom: 20}}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({animated: true})}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={msg.sender === 'ai' ? styles.msgAiContainer : styles.msgUserContainer}>
              <View style={[styles.msgBubble, msg.sender === 'ai' ? styles.msgBubbleAi : styles.msgBubbleUser]}>
                <Text style={msg.sender === 'ai' ? {color: '#333'} : {color: '#fff'}}>
                  {msg.text}
                </Text>
              </View>
              {msg.options && msg.sender === 'ai' && (
                <View style={styles.optionsContainer}>
                  {msg.options.map(opt => (
                    <Button
                      key={opt}
                      size="tiny"
                      appearance="outline"
                      status="success"
                      style={styles.optionButton}
                      onPress={() => handleOptionSelect(opt)}
                      disabled={isTyping}
                    >
                      {opt}
                    </Button>
                  ))}
                </View>
              )}
            </View>
          ))}
          {isTyping && (
            <View style={styles.typingContainer}>
              <Icon name="more-horizontal" width={32} height={32} fill="#8F9BB3" animation="pulse" />
            </View>
          )}
        </ScrollView>

        <Button appearance="ghost" onPress={onClose} status="basic">Fechar Chat</Button>
      </Card>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalCard: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 20,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
    paddingBottom: 15,
    marginBottom: 10,
  },
  chatArea: {
    flex: 1,
  },
  msgAiContainer: {
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  msgUserContainer: {
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  msgBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  msgBubbleAi: {
    backgroundColor: '#F7F9FC',
    borderBottomLeftRadius: 4,
  },
  msgBubbleUser: {
    backgroundColor: '#00E096',
    borderBottomRightRadius: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  optionButton: {
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
  },
  typingContainer: {
    padding: 10,
    alignItems: 'flex-start',
  },
});

export default AICopilotModal;
