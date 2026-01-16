import { action, observable } from 'mobx';

export interface Station {
    id: number;
    name: string;
    address: string;
    priceGas: number;
    priceEthanol: number;
    latitude: number;
    longitude: number;
}

export default class StationsStore {
    @observable stations: Station[] = [
        {
            id: 1,
            name: 'Posto Ipiranga',
            address: 'Av. Paulista, 1000',
            priceGas: 5.59,
            priceEthanol: 3.79,
            latitude: -23.561684,
            longitude: -46.655981
        },
        {
            id: 2,
            name: 'Posto Shell',
            address: 'Rua Augusta, 500',
            priceGas: 5.49,
            priceEthanol: 3.89,
            latitude: -23.553205,
            longitude: -46.654251
        },
        {
            id: 3,
            name: 'Posto BR',
            address: 'Av. Rebouças, 2000',
            priceGas: 5.69,
            priceEthanol: 3.69,
            latitude: -23.566838,
            longitude: -46.671047
        }
    ];

    @observable favorites: number[] = [];

    @action toggleFavorite = (id: number) => {
        if (this.favorites.includes(id)) {
            this.favorites = this.favorites.filter(favId => favId !== id);
        } else {
            this.favorites.push(id);
        }
    }

    @action isFavorite = (id: number) => {
        return this.favorites.includes(id);
    }
}

const stationsStore = new StationsStore();
export { stationsStore };
