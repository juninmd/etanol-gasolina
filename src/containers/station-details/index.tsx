import React, { Component } from 'react';
import { StyleSheet, ScrollView, View, Linking, Animated } from 'react-native';
import { Layout, Text, Button, Icon, Input, Card, TopNavigation, TopNavigationAction, Divider } from '@ui-kitten/components';
import { inject, observer } from 'mobx-react';
import StationsStore from '../../stores/stations.store';
import { StationComments } from '../../components/StationComments';
import { PriceHistoryChart } from '../../components/PriceHistoryChart';

interface Props {
    navigation: any;
    route: any;
    stationsStore: StationsStore;
}

interface State {
    showUpdatePrice: boolean;
    newGasPrice: string;
    newEthanolPrice: string;
    simAmount: string;
}

const BackIcon = (props) => (
    <Icon {...props} name='arrow-back' />
);

@inject('stationsStore')
@observer
export default class StationDetails extends Component<Props, State> {
    state: State = {
        showUpdatePrice: false,
        newGasPrice: '',
        newEthanolPrice: '',
        simAmount: ''
    };

    pulseAnim = new Animated.Value(1);

    componentDidMount() {
        this.startPulse();
    }

    startPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(this.pulseAnim, {
                    toValue: 0.6,
                    duration: 800,
                    useNativeDriver: true // Add this line
                }),
                Animated.timing(this.pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true // Add this line
                })
            ])
        ).start();
    }

    navigateBack = () => {
        this.props.navigation.goBack();
    };

    renderBackAction = () => (
        <TopNavigationAction icon={BackIcon} onPress={this.navigateBack} />
    );

    renderRightAction = () => {
        const { stationsStore, route } = this.props;
        const { stationId } = route.params;
        const isFav = stationsStore.isFavorite(stationId);

        const HeartIcon = (props) => (
             <Icon {...props} name={isFav ? 'heart' : 'heart-outline'} fill={isFav ? '#FF3D71' : '#8F9BB3'} />
        );

        return (
            <TopNavigationAction icon={HeartIcon} onPress={() => stationsStore.toggleFavorite(stationId)} />
        );
    };

    handleAddComment = (text: string, rating: number) => {
        const { route, stationsStore } = this.props;
        const { stationId } = route.params;

        stationsStore.addComment(stationId, text, rating);
        alert('🎉 Avaliação enviada!\n\n⭐ +5 PONTOS! Continue ajudando a comunidade.');
    };

    handleUpdatePrice = () => {
        const { route, stationsStore } = this.props;
        const { stationId } = route.params;
        const { newGasPrice, newEthanolPrice } = this.state;

        if (newGasPrice && newEthanolPrice) {
            stationsStore.updatePrice(stationId, parseFloat(newGasPrice), parseFloat(newEthanolPrice));
            this.setState({ showUpdatePrice: false, newGasPrice: '', newEthanolPrice: '' });
            alert('⛽ Preços Atualizados!\n\n🏆 +10 PONTOS! Você é um motorista inteligente!');
        }
    };

    handleConfirmPrice = () => {
        const { route, stationsStore } = this.props;
        const { stationId } = route.params;
        stationsStore.verifyPrice(stationId);
        alert('✅ Obrigado pela confirmação!\n\n🏆 +5 PONTOS! A comunidade agradece.');
    };

    handleRoute = (station) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
        Linking.openURL(url).catch(err => console.error('An error occurred', err));
    };

    render() {
        const { route, stationsStore, navigation } = this.props;
        const { stationId } = route.params;
        const station = stationsStore.stations.find(s => s.id === stationId);

        if (!station) return <Layout style={styles.container}><Text>Posto não encontrado</Text></Layout>;

        // Reliability Logic
        const lastVerifiedDate = station.lastVerified ? new Date(station.lastVerified) : new Date(0);
        const hoursSince = (new Date().getTime() - lastVerifiedDate.getTime()) / (1000 * 60 * 60);
        let trustStatus = 'basic';
        let trustColor = '#8F9BB3';
        let trustText = 'Sem verificação recente';

        if (hoursSince < 24) {
            trustStatus = 'success';
            trustColor = '#00E096';
            trustText = `Preço Confiável (Verificado há ${Math.floor(hoursSince)}h)`;
        } else if (hoursSince < 72) {
            trustStatus = 'warning';
            trustColor = '#FFAAA5';
            trustText = 'Preço pode estar desatualizado';
        } else {
            trustStatus = 'danger';
            trustColor = '#FF3D71';
            trustText = 'Preço antigo! Ajude a atualizar.';
        }

        return (
            <Layout style={styles.container}>
                <TopNavigation
                    title={station.name}
                    alignment='center'
                    leftControl={this.renderBackAction()}
                    rightControls={[this.renderRightAction()]}
                />
                <Divider />
                <ScrollView contentContainerStyle={styles.content}>
                    <Card style={styles.card}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                            <View style={{flex: 1}}>
                                <Text category='h5'>{station.name}</Text>
                                <Text category='s1' style={styles.address}>{station.address}</Text>
                            </View>
                            {/* Live Badge */}
                            <Animated.View style={[styles.liveBadge, { opacity: this.pulseAnim }]}>
                                <View style={styles.liveDot} />
                                <Text category='c2' style={{color: 'white', fontWeight: 'bold'}}>AO VIVO</Text>
                            </Animated.View>
                        </View>

                        {/* Reliability Badge */}
                        <View style={[styles.trustBadge, { borderColor: trustColor }]}>
                             <Icon name={hoursSince < 24 ? 'checkmark-circle-2' : 'alert-circle'} width={16} height={16} fill={trustColor} />
                             <Text category='c1' style={{color: trustColor, marginLeft: 5, fontWeight: 'bold'}}>{trustText}</Text>
                             <Text category='c2' appearance='hint' style={{marginLeft: 'auto'}}>{station.verificationsCount || 0} verificações</Text>
                        </View>

                        <View style={styles.priceRow}>
                            <View style={styles.priceBox}>
                                <Text category='label'>Gasolina</Text>
                                <Text category='h4' status='info'>R$ {station.priceGas.toFixed(2)}</Text>
                            </View>
                            <View style={styles.priceBox}>
                                <Text category='label'>Etanol</Text>
                                <Text category='h4' status='success'>R$ {station.priceEthanol.toFixed(2)}</Text>
                            </View>
                        </View>
                        {station.isPromo && (
                            <Button status='warning' size='small' style={styles.promoBadge}>Em Promoção!</Button>
                        )}
                    </Card>

                    {/* Smart Choice Widget */}
                    <Card style={[styles.card, { backgroundColor: (station.priceEthanol / station.priceGas) < 0.7 ? '#F0FFF4' : '#FFF5F5' }]}>
                         <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                            <View>
                                <Text category='h6'>Escolha Inteligente</Text>
                                <Text category='c2' appearance='hint'>Relação Etanol/Gasolina: {((station.priceEthanol / station.priceGas) * 100).toFixed(0)}%</Text>
                            </View>
                            <View style={{alignItems: 'flex-end'}}>
                                <Text category='h6' status={(station.priceEthanol / station.priceGas) < 0.7 ? 'success' : 'danger'}>
                                    {(station.priceEthanol / station.priceGas) < 0.7 ? 'VÁ DE ETANOL' : 'VÁ DE GASOLINA'}
                                </Text>
                            </View>
                        </View>
                    </Card>

                    {/* Price Forecast Section (AI Mock) */}
                    <Card style={[styles.card, { borderColor: station.id % 2 === 0 ? '#3366FF' : '#FF3D71', borderTopWidth: 5 }]}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Icon name={station.id % 2 === 0 ? 'trending-down-outline' : 'trending-up-outline'} width={32} height={32} fill={station.id % 2 === 0 ? '#3366FF' : '#FF3D71'} />
                            <View style={{marginLeft: 15}}>
                                <Text category='h6'>Tendência de Preço (IA)</Text>
                                <Text category='c1' appearance='hint'>Previsão para as próximas 24h</Text>
                            </View>
                        </View>
                        <Divider style={{marginVertical: 10}}/>
                        <Text category='p2'>
                            Nossa IA analisou o histórico e prevê uma
                            <Text category='s1' status={station.id % 2 === 0 ? 'success' : 'danger'}> {station.id % 2 === 0 ? 'QUEDA' : 'ALTA'} </Text>
                            nos preços.
                            {station.id % 2 === 0 ? ' Pode valer a pena esperar um pouco!' : ' Recomendamos abastecer agora para garantir este preço.'}
                        </Text>
                    </Card>

                    {/* Price History Section */}
                    {station.priceHistory && station.priceHistory.length > 0 && (
                        <Card style={styles.card}>
                            <PriceHistoryChart history={station.priceHistory} />
                        </Card>
                    )}

                    {/* Fuel Simulator */}
                    <Card style={styles.card}>
                        <Text category='h6'>Simulador de Abastecimento</Text>
                        <Text category='c2' appearance='hint' style={{marginBottom: 10}}>Veja quanto rende o seu dinheiro aqui.</Text>
                        <Input
                            placeholder='Quanto você quer gastar? (R$)'
                            value={this.state.simAmount}
                            onChangeText={text => this.setState({ simAmount: text })}
                            keyboardType='numeric'
                            style={styles.input}
                        />
                        {this.state.simAmount ? (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 }}>
                                <View style={{ alignItems: 'center' }}>
                                    <Text category='s2' appearance='hint'>Gasolina</Text>
                                    <Text category='h4' status='info'>
                                        {(parseFloat(this.state.simAmount.replace(',', '.')) / station.priceGas).toFixed(2)} L
                                    </Text>
                                </View>
                                <View style={{ width: 1, backgroundColor: '#EEE' }} />
                                <View style={{ alignItems: 'center' }}>
                                    <Text category='s2' appearance='hint'>Etanol</Text>
                                    <Text category='h4' status='success'>
                                        {(parseFloat(this.state.simAmount.replace(',', '.')) / station.priceEthanol).toFixed(2)} L
                                    </Text>
                                </View>
                            </View>
                        ) : null}
                    </Card>

                    <Button
                        style={styles.button}
                        status='info'
                        onPress={() => this.handleRoute(station)}
                        accessoryLeft={(props) => <Icon {...props} name='navigation-2-outline'/>}
                    >
                        Traçar Rota
                    </Button>

                    <Button
                        style={styles.button}
                        status='success'
                        onPress={() => navigation.navigate('AddFill', { stationId: station.id })}
                        accessoryLeft={(props) => <Icon {...props} name='droplet'/>}
                    >
                        Registrar Abastecimento
                    </Button>

                    <View style={styles.actionButtonsContainer}>
                        <Button
                            style={[styles.button, {flex: 1, marginRight: 5}]}
                            status='success'
                            appearance='outline'
                            onPress={this.handleConfirmPrice}
                            accessoryLeft={(props) => <Icon {...props} name='checkmark-circle-2-outline'/>}
                        >
                            Confirmar Preço
                        </Button>
                        <Button
                            style={[styles.button, {flex: 1, marginLeft: 5}]}
                            status='primary'
                            onPress={() => this.setState({ showUpdatePrice: !this.state.showUpdatePrice })}
                            accessoryLeft={(props) => <Icon {...props} name='edit-outline'/>}
                        >
                            Atualizar
                        </Button>
                    </View>

                    {this.state.showUpdatePrice && (
                        <Card style={styles.card}>
                            <Text category='h6'>Atualizar Preços</Text>
                            <Input
                                placeholder='Preço Gasolina'
                                value={this.state.newGasPrice}
                                onChangeText={text => this.setState({ newGasPrice: text })}
                                keyboardType='numeric'
                                style={styles.input}
                            />
                            <Input
                                placeholder='Preço Etanol'
                                value={this.state.newEthanolPrice}
                                onChangeText={text => this.setState({ newEthanolPrice: text })}
                                keyboardType='numeric'
                                style={styles.input}
                            />
                            <Button onPress={this.handleUpdatePrice}>Salvar</Button>
                        </Card>
                    )}

                    <StationComments
                        comments={station.comments}
                        onAddComment={this.handleAddComment}
                    />
                </ScrollView>
            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 15,
        paddingBottom: 50,
    },
    card: {
        marginBottom: 15,
    },
    address: {
        color: '#888',
        marginBottom: 10,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    priceBox: {
        alignItems: 'center',
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        padding: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: 'rgba(0,0,0,0.02)'
    },
    promoBadge: {
        marginTop: 10,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        marginBottom: 10
    },
    button: {
        marginBottom: 15,
    },
    input: {
        marginVertical: 5,
    },
    sectionTitle: {
        marginTop: 10,
        marginBottom: 10,
    },
    liveBadge: {
        backgroundColor: '#FF3D71',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        right: 0
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'white',
        marginRight: 4
    }
});
