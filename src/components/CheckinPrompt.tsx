import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { Card, Text, Button, Input, Icon, Layout } from '@ui-kitten/components';
import { inject, observer } from 'mobx-react';
import StationsStore from '../stores/stations.store';

interface Props {
    stationsStore?: StationsStore;
}

const { width, height } = Dimensions.get('window');

const CheckinPrompt = inject('stationsStore')(observer(({ stationsStore }: Props) => {
    const { checkinStation } = stationsStore!;

    // Animation
    const slideAnim = useRef(new Animated.Value(300)).current;

    // Local State for Inline Update
    const [isUpdating, setIsUpdating] = useState(false);
    const [gasPrice, setGasPrice] = useState('');
    const [ethPrice, setEthPrice] = useState('');

    useEffect(() => {
        if (checkinStation) {
            // Pre-fill prices
            setGasPrice(checkinStation.priceGas.toString());
            setEthPrice(checkinStation.priceEthanol.toString());

            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true
            }).start();
        } else {
            setIsUpdating(false); // Reset state
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true
            }).start();
        }
    }, [checkinStation]);

    if (!checkinStation) return null;

    const handleDismiss = () => {
        Animated.timing(slideAnim, {
            toValue: 300,
            duration: 200,
            useNativeDriver: true
        }).start(() => {
            stationsStore!.dismissCheckin();
        });
    };

    const handleUpdate = () => {
        const gas = parseFloat(gasPrice);
        const eth = parseFloat(ethPrice);

        if (!isNaN(gas) && !isNaN(eth)) {
            stationsStore!.updatePrice(checkinStation.id, gas, eth);
            alert('Preços atualizados! Você ganhou pontos.');
            handleDismiss();
        }
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
            <Card style={styles.card} status='primary'>
                <View style={styles.header}>
                    <Icon name='pin' width={24} height={24} fill='#3366FF' />
                    <Text category='h6' style={{ marginLeft: 10 }}>Você está aqui?</Text>
                </View>

                <Text category='s1' style={{ marginVertical: 10, textAlign: 'center' }}>
                    {checkinStation.name}
                </Text>

                {!isUpdating ? (
                    <>
                        <Text category='p2' style={{ marginBottom: 15, textAlign: 'center', color: '#8F9BB3' }}>
                            Ajude a comunidade atualizando os preços e ganhe pontos!
                        </Text>
                        <View style={styles.buttonRow}>
                            <Button
                                status='basic'
                                appearance='ghost'
                                onPress={handleDismiss}
                                style={{ flex: 1, marginRight: 10 }}
                            >
                                Não estou
                            </Button>
                            <Button
                                status='primary'
                                onPress={() => setIsUpdating(true)}
                                style={{ flex: 1 }}
                            >
                                Atualizar Preços
                            </Button>
                        </View>
                    </>
                ) : (
                    <>
                         <View style={styles.inputsRow}>
                            <Input
                                style={styles.input}
                                label='Gasolina'
                                value={gasPrice}
                                onChangeText={setGasPrice}
                                keyboardType='numeric'
                            />
                            <Input
                                style={styles.input}
                                label='Etanol'
                                value={ethPrice}
                                onChangeText={setEthPrice}
                                keyboardType='numeric'
                            />
                        </View>
                        <View style={styles.buttonRow}>
                            <Button
                                status='basic'
                                appearance='ghost'
                                onPress={() => setIsUpdating(false)}
                                style={{ flex: 1, marginRight: 10 }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                status='success'
                                onPress={handleUpdate}
                                style={{ flex: 1 }}
                            >
                                Salvar
                            </Button>
                        </View>
                    </>
                )}
            </Card>
        </Animated.View>
    );
}));

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 100, // Above everything
    },
    card: {
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    inputsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    input: {
        flex: 1,
        marginHorizontal: 5
    }
});

export default CheckinPrompt;
