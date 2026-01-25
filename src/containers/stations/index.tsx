import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Layout, Text, List, ListItem, Icon, Button, Card, Toggle } from '@ui-kitten/components';
import { inject, observer } from 'mobx-react';
import MapView, { Marker } from 'react-native-maps';
import StationsStore from '../../stores/stations.store';

interface Props {
    stationsStore: StationsStore;
    navigation: any;
}

interface State {
    showMap: boolean;
}

@inject('stationsStore')
@observer
export default class Stations extends Component<Props, State> {
    state: State = {
        showMap: false,
    };

    mapRef: MapView | null = null;

    handleFindBestPrice = () => {
        const { bestStation } = this.props.stationsStore;
        if (bestStation) {
            this.setState({ showMap: true }, () => {
                 if (this.mapRef) {
                    this.mapRef.animateToRegion({
                        latitude: bestStation.latitude,
                        longitude: bestStation.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }, 1000);
                }
            });
        }
    };

    renderItemAccessory = (id: number) => {
        const { isFavorite, toggleFavorite } = this.props.stationsStore;
        const fav = isFavorite(id);
        return (
            <Button
                size='tiny'
                appearance='ghost'
                status={fav ? 'danger' : 'basic'}
                icon={(style) => <Icon {...style} name={fav ? 'heart' : 'heart-outline'} />}
                onPress={() => toggleFavorite(id)}
            />
        );
    };

    onItemPress = (stationId: number) => {
        this.props.navigation.navigate('StationDetails', { stationId });
    };

    renderItem = ({ item }) => (
        <ListItem
            title={`${item.name} ${item.isPromo ? '(Promoção!)' : ''}`}
            description={`${item.address}\nGas: R$ ${item.priceGas} | Etanol: R$ ${item.priceEthanol}`}
            accessory={() => this.renderItemAccessory(item.id)}
            style={styles.item}
            onPress={() => this.onItemPress(item.id)}
        />
    );

    toggleView = (checked: boolean) => {
        this.setState({ showMap: checked });
    };

    render() {
        const { filteredStations, filterPromo, toggleFilterPromo } = this.props.stationsStore;
        const { showMap } = this.state;

        // Calculate Average Gas Price for Color Coding
        const avgGas = filteredStations.length > 0
            ? filteredStations.reduce((acc, curr) => acc + curr.priceGas, 0) / filteredStations.length
            : 0;

        return (
            <Layout style={styles.container}>
                <View style={styles.header}>
                    <Text category='h4'>Postos Próximos</Text>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleLabel}>Mapa</Text>
                        <Toggle checked={showMap} onChange={this.toggleView} />
                    </View>
                </View>

                <View style={styles.controls}>
                     <View style={styles.toggleContainer}>
                        <Text style={styles.toggleLabel}>Só Promo</Text>
                        <Toggle checked={filterPromo} onChange={toggleFilterPromo} status='warning'/>
                    </View>
                    <Button size='tiny' status='success' onPress={this.handleFindBestPrice}>Melhor Preço</Button>
                </View>

                {showMap ? (
                    <MapView
                        ref={ref => this.mapRef = ref}
                        style={styles.map}
                        initialRegion={{
                            latitude: -23.561684,
                            longitude: -46.655981,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                    >
                        {filteredStations.map(station => {
                            let pinColor = 'orange'; // Average
                            if (station.isPromo) {
                                pinColor = 'gold';
                            } else if (avgGas > 0) {
                                if (station.priceGas < avgGas * 0.95) pinColor = 'green'; // Cheap
                                else if (station.priceGas > avgGas * 1.05) pinColor = 'red'; // Expensive
                            }

                            return (
                                <Marker
                                    key={station.id}
                                    coordinate={{
                                        latitude: station.latitude,
                                        longitude: station.longitude,
                                    }}
                                    title={station.name}
                                    description={`Gas: ${station.priceGas} | Etanol: ${station.priceEthanol}`}
                                    onCalloutPress={() => this.onItemPress(station.id)}
                                    pinColor={pinColor}
                                />
                            );
                        })}
                    </MapView>
                ) : (
                    <List
                        data={filteredStations}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 15,
        marginBottom: 10,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 15,
        marginBottom: 10,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleLabel: {
        marginRight: 10,
    },
    title: {
        textAlign: 'center',
    },
    item: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    map: {
        flex: 1,
    },
});
