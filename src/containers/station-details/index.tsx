import React, { Component } from 'react';
import { StyleSheet, ScrollView, View, Linking } from 'react-native';
import { Layout, Text, Button, Icon, Input, List, ListItem, Card, TopNavigation, TopNavigationAction, Divider } from '@ui-kitten/components';
import { inject, observer } from 'mobx-react';
import StationsStore from '../../stores/stations.store';

interface Props {
    navigation: any;
    route: any;
    stationsStore: StationsStore;
}

interface State {
    commentText: string;
    showUpdatePrice: boolean;
    newGasPrice: string;
    newEthanolPrice: string;
}

const BackIcon = (props) => (
    <Icon {...props} name='arrow-back' />
);

@inject('stationsStore')
@observer
export default class StationDetails extends Component<Props, State> {
    state: State = {
        commentText: '',
        showUpdatePrice: false,
        newGasPrice: '',
        newEthanolPrice: ''
    };

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

    handleAddComment = () => {
        const { route, stationsStore } = this.props;
        const { stationId } = route.params;
        const { commentText } = this.state;

        if (commentText.trim()) {
            stationsStore.addComment(stationId, commentText);
            this.setState({ commentText: '' });
            alert('🎉 Avaliação enviada!\n\n⭐ +5 PONTOS! Continue ajudando a comunidade.');
        }
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

    handleRoute = (station) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
        Linking.openURL(url).catch(err => console.error('An error occurred', err));
    };

    renderCommentItem = ({ item }) => (
        <View key={item.id} style={styles.commentBubbleContainer}>
            <View style={styles.avatar}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>{item.author ? item.author.charAt(0).toUpperCase() : 'U'}</Text>
            </View>
            <View style={styles.commentBubble}>
                <View style={styles.commentHeader}>
                    <Text category='s2'>{item.author}</Text>
                    <Text category='c2' appearance='hint'>{item.date}</Text>
                </View>
                <Text category='p1' style={{marginTop: 5}}>{item.text}</Text>
            </View>
        </View>
    );

    renderChart = (history) => {
        if (!history || history.length === 0) return null;

        const maxPrice = Math.max(
            ...history.map(h => Math.max(h.gas, h.ethanol))
        ) || 6.0;

        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
                <View style={styles.chartContainer}>
                    {history.map((item, index) => {
                        const gasHeight = (item.gas / maxPrice) * 120;
                        const ethHeight = (item.ethanol / maxPrice) * 120;

                        return (
                            <View key={index} style={styles.chartBarGroup}>
                                <View style={styles.barsRow}>
                                    <View style={[styles.bar, { height: gasHeight, backgroundColor: '#3366FF', marginRight: 4 }]} />
                                    <View style={[styles.bar, { height: ethHeight, backgroundColor: '#00E096' }]} />
                                </View>
                                <Text category='c1' style={styles.chartDate}>{item.date}</Text>
                                <Text category='c2' appearance='hint'>{item.gas.toFixed(2)}</Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        );
    }

    render() {
        const { route, stationsStore, navigation } = this.props;
        const { stationId } = route.params;
        const station = stationsStore.stations.find(s => s.id === stationId);

        if (!station) return <Layout style={styles.container}><Text>Posto não encontrado</Text></Layout>;

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
                        <Text category='h5'>{station.name}</Text>
                        <Text category='s1' style={styles.address}>{station.address}</Text>
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

                    {/* Price History Section */}
                    {station.priceHistory && station.priceHistory.length > 0 && (
                        <Card style={styles.card}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Text category='h6' style={styles.sectionTitle}>Evolução de Preços</Text>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{width: 10, height: 10, backgroundColor: '#3366FF', marginRight: 5}} />
                                    <Text category='c2' appearance='hint' style={{marginRight: 10}}>Gas</Text>
                                    <View style={{width: 10, height: 10, backgroundColor: '#00E096', marginRight: 5}} />
                                    <Text category='c2' appearance='hint'>Eta</Text>
                                </View>
                            </View>
                            {this.renderChart(station.priceHistory)}
                        </Card>
                    )}

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

                    <Button
                        style={styles.button}
                        status='primary'
                        onPress={() => this.setState({ showUpdatePrice: !this.state.showUpdatePrice })}
                        accessoryLeft={(props) => <Icon {...props} name='edit-outline'/>}
                    >
                        Estou aqui! Atualizar Preço
                    </Button>

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

                    <Text category='h6' style={styles.sectionTitle}>Comentários da Comunidade ({station.comments.length})</Text>
                    <View style={styles.commentsList}>
                        {station.comments.slice().map((item) => this.renderCommentItem({ item }))}
                    </View>

                    <Card style={styles.addCommentCard}>
                        <Text category='s2' style={{marginBottom: 10}}>Avalie este posto</Text>
                        <Input
                            placeholder='Como está o atendimento e o preço?'
                            value={this.state.commentText}
                            onChangeText={text => this.setState({ commentText: text })}
                            style={styles.commentInput}
                            multiline={true}
                            textStyle={{ minHeight: 64 }}
                        />
                        <Button size='small' onPress={this.handleAddComment} accessoryRight={(p)=><Icon {...p} name='paper-plane-outline'/>}>
                            Publicar Avaliação
                        </Button>
                    </Card>
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
    promoBadge: {
        marginTop: 10,
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
    commentsList: {
        marginBottom: 20,
    },
    commentBubbleContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3366FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    commentBubble: {
        flex: 1,
        backgroundColor: '#F7F9FC',
        borderRadius: 12,
        padding: 12,
        borderBottomLeftRadius: 0,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addCommentCard: {
        marginTop: 10,
    },
    commentInput: {
        marginBottom: 10,
    },
    historyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    historyItem: {
        alignItems: 'center',
    },
    chartScroll: {
        marginTop: 10,
    },
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 150,
        paddingBottom: 10,
    },
    chartBarGroup: {
        marginRight: 20,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
    },
    barsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 5,
    },
    bar: {
        width: 12,
        borderRadius: 4,
    },
    chartDate: {
        marginTop: 2,
    }
});
