import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Layout, Text, List, ListItem, Icon, Button } from '@ui-kitten/components';
import { inject, observer } from 'mobx-react';
import StationsStore from '../../stores/stations.store';

interface Props {
    stationsStore: StationsStore;
    navigation: any;
}

@inject('stationsStore')
@observer
export default class Favorites extends Component<Props> {

    renderItemAccessory = (id: number) => {
        const { isFavorite, toggleFavorite } = this.props.stationsStore;
        return (
            <Button
                size='tiny'
                appearance='ghost'
                status='danger'
                icon={(style) => <Icon {...style} name='heart' />}
                onPress={() => toggleFavorite(id)}
            />
        );
    };

    onItemPress = (stationId: number) => {
        this.props.navigation.navigate('StationDetails', { stationId });
    };

    renderItem = ({ item }) => (
        <ListItem
            title={`${item.name}`}
            description={`${item.address}\nGas: R$ ${item.priceGas} | Etanol: R$ ${item.priceEthanol}`}
            accessory={() => this.renderItemAccessory(item.id)}
            style={styles.item}
            onPress={() => this.onItemPress(item.id)}
        />
    );

    render() {
        const { stations, favorites } = this.props.stationsStore;
        const favoriteStations = stations.filter(s => favorites.includes(s.id));

        return (
            <Layout style={styles.container}>
                <Text category='h4' style={styles.title}>Meus Favoritos</Text>
                {favoriteStations.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum posto favoritado ainda.</Text>
                ) : (
                    <List
                        data={favoriteStations}
                        renderItem={this.renderItem}
                    />
                )}
            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
    },
    title: {
        margin: 15,
        textAlign: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
    item: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    }
});
