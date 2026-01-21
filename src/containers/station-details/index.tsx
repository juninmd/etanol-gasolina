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

    handleAddComment = () => {
        const { route, stationsStore } = this.props;
        const { stationId } = route.params;
        const { commentText } = this.state;

        if (commentText.trim()) {
            stationsStore.addComment(stationId, commentText);
            this.setState({ commentText: '' });
            alert('Comentário adicionado! Você ganhou 5 pontos.');
        }
    };

    handleUpdatePrice = () => {
        const { route, stationsStore } = this.props;
        const { stationId } = route.params;
        const { newGasPrice, newEthanolPrice } = this.state;

        if (newGasPrice && newEthanolPrice) {
            stationsStore.updatePrice(stationId, parseFloat(newGasPrice), parseFloat(newEthanolPrice));
            this.setState({ showUpdatePrice: false, newGasPrice: '', newEthanolPrice: '' });
            alert('Preços atualizados com sucesso! Você ganhou 10 pontos.');
        }
    };

    handleRoute = (station) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
        Linking.openURL(url).catch(err => console.error('An error occurred', err));
    };

    renderCommentItem = ({ item }) => (
        <ListItem
            title={item.author}
            description={`${item.date}\n${item.text}`}
            style={styles.commentItem}
        />
    );

    renderHistoryItem = (item, index) => (
        <View key={index} style={styles.historyItem}>
            <Text category='c1'>{item.date}</Text>
            <Text category='c1' status='info'>G: {item.gas.toFixed(2)}</Text>
            <Text category='c1' status='success'>E: {item.ethanol.toFixed(2)}</Text>
        </View>
    );

    render() {
        const { route, stationsStore } = this.props;
        const { stationId } = route.params;
        const station = stationsStore.stations.find(s => s.id === stationId);

        if (!station) return <Layout style={styles.container}><Text>Posto não encontrado</Text></Layout>;

        return (
            <Layout style={styles.container}>
                <TopNavigation title={station.name} alignment='center' leftControl={this.renderBackAction()} />
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
                            <Text category='h6' style={styles.sectionTitle}>Histórico de Preços</Text>
                            <View style={styles.historyContainer}>
                                {station.priceHistory.slice(-5).map(this.renderHistoryItem)}
                            </View>
                        </Card>
                    )}

                    <Button
                        style={styles.button}
                        status='info'
                        onPress={() => this.handleRoute(station)}
                    >
                        Traçar Rota
                    </Button>

                    <Button
                        style={styles.button}
                        status='primary'
                        onPress={() => this.setState({ showUpdatePrice: !this.state.showUpdatePrice })}
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

                    <Text category='h6' style={styles.sectionTitle}>Comentários</Text>
                    <List
                        data={station.comments.slice()} // MobX observable array to JS array
                        renderItem={this.renderCommentItem}
                        scrollEnabled={false}
                    />

                    <View style={styles.addCommentContainer}>
                        <Input
                            placeholder='Adicione um comentário...'
                            value={this.state.commentText}
                            onChangeText={text => this.setState({ commentText: text })}
                            style={styles.commentInput}
                        />
                        <Button size='small' onPress={this.handleAddComment}>Enviar</Button>
                    </View>
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
    commentItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    addCommentContainer: {
        marginTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentInput: {
        flex: 1,
        marginRight: 10,
    },
    historyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    historyItem: {
        alignItems: 'center',
    }
});
