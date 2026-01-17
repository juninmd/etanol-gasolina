import { action, observable } from 'mobx';

export interface Comment {
    id: number;
    text: string;
    author: string;
    date: string;
}

export interface Station {
    id: number;
    name: string;
    address: string;
    priceGas: number;
    priceEthanol: number;
    latitude: number;
    longitude: number;
    isPromo: boolean;
    comments: Comment[];
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
            longitude: -46.655981,
            isPromo: true,
            comments: [
                { id: 1, text: 'Ótimo atendimento!', author: 'João', date: '10/05/2023' }
            ]
        },
        {
            id: 2,
            name: 'Posto Shell',
            address: 'Rua Augusta, 500',
            priceGas: 5.49,
            priceEthanol: 3.89,
            latitude: -23.553205,
            longitude: -46.654251,
            isPromo: false,
            comments: []
        },
        {
            id: 3,
            name: 'Posto BR',
            address: 'Av. Rebouças, 2000',
            priceGas: 5.69,
            priceEthanol: 3.69,
            latitude: -23.566838,
            longitude: -46.671047,
            isPromo: false,
            comments: []
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

    @action addComment = (stationId: number, text: string) => {
        const station = this.stations.find(s => s.id === stationId);
        if (station) {
            station.comments.push({
                id: Date.now(),
                text,
                author: 'Você',
                date: new Date().toLocaleDateString()
            });
        }
    }

    @action updatePrice = (stationId: number, gas: number, ethanol: number) => {
        const station = this.stations.find(s => s.id === stationId);
        if (station) {
            station.priceGas = gas;
            station.priceEthanol = ethanol;
        }
    }
}

const stationsStore = new StationsStore();
export { stationsStore };
