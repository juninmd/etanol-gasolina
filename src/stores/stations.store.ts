import { action, observable, computed, runInAction } from 'mobx';
import { homeStore } from './home.store';

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
    priceHistory: { date: string, gas: number, ethanol: number }[];
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
            ],
            priceHistory: [
                { date: '01/05', gas: 5.49, ethanol: 3.69 },
                { date: '05/05', gas: 5.55, ethanol: 3.75 },
                { date: '10/05', gas: 5.59, ethanol: 3.79 },
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
            comments: [],
            priceHistory: [
                { date: '01/05', gas: 5.39, ethanol: 3.79 },
                { date: '10/05', gas: 5.49, ethanol: 3.89 },
            ]
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
            comments: [],
            priceHistory: []
        }
    ];

    @observable favorites: number[] = [];
    @observable filterPromo = false;
    @observable totalSavings = 125.50;
    @observable points = 150; // Initial gamification points
    @observable checkinStation: Station | null = null;

    constructor() {
        this.startRealTimeUpdates();
        this.startGeofenceSimulation();
    }

    startRealTimeUpdates() {
        // Simulates real-time price updates from an API
        setInterval(() => {
            runInAction(() => {
                this.stations.forEach(station => {
                    if (Math.random() > 0.7) { // 30% chance to update
                        const change = (Math.random() - 0.5) * 0.10; // +/- 0.05
                        station.priceGas = Math.max(3.0, parseFloat((station.priceGas + change).toFixed(2)));
                        station.priceEthanol = Math.max(2.0, parseFloat((station.priceEthanol + change * 0.7).toFixed(2)));
                    }
                });
            });
        }, 5000);
    }

    startGeofenceSimulation() {
        // Simulates detecting that the user is near a station (Geofencing)
        setTimeout(() => {
            runInAction(() => {
                // Randomly pick a station to "be at"
                this.checkinStation = this.stations[Math.floor(Math.random() * this.stations.length)];
            });
        }, 8000);
    }

    @action dismissCheckin = () => {
        this.checkinStation = null;
    }

    @computed get level() {
        if (this.points < 200) return 'Novato';
        if (this.points < 500) return 'Explorador';
        return 'Mestre';
    }

    @computed get nextLevelPoints() {
        if (this.points < 200) return 200;
        if (this.points < 500) return 500;
        return 1000; // Cap or next huge milestone
    }

    @computed get progress() {
        if (this.points < 200) {
            return this.points / 200;
        }
        if (this.points < 500) {
            return (this.points - 200) / (300);
        }
        return Math.min(1, (this.points - 500) / 500);
    }

    @computed get filteredStations() {
        if (this.filterPromo) {
            return this.stations.filter(s => s.isPromo);
        }
        return this.stations;
    }

    @computed get bestStation() {
        if (this.stations.length === 0) return null;

        const etanolCons = parseFloat(homeStore.etanolConsumption.replace(',', '.'));
        const gasCons = parseFloat(homeStore.gasolinaConsumption.replace(',', '.'));
        const useCustomCons = !isNaN(etanolCons) && !isNaN(gasCons) && etanolCons > 0 && gasCons > 0;

        return this.stations.slice().sort((a, b) => {
            let costA, costB;

            if (useCustomCons) {
                const costAEthanol = a.priceEthanol / etanolCons;
                const costAGas = a.priceGas / gasCons;
                const costBEthanol = b.priceEthanol / etanolCons;
                const costBGas = b.priceGas / gasCons;
                costA = Math.min(costAEthanol, costAGas);
                costB = Math.min(costBEthanol, costBGas);
            } else {
                const costAEthanol = a.priceEthanol / 0.7;
                const costBEthanol = b.priceEthanol / 0.7;
                costA = Math.min(a.priceGas, costAEthanol);
                costB = Math.min(b.priceGas, costBEthanol);
            }

            return costA - costB;
        })[0];
    }

    @action toggleFilterPromo = () => {
        this.filterPromo = !this.filterPromo;
    }

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
            this.addPoints(5); // 5 points for comment
        }
    }

    @action updatePrice = (stationId: number, gas: number, ethanol: number) => {
        const station = this.stations.find(s => s.id === stationId);
        if (station) {
            station.priceGas = gas;
            station.priceEthanol = ethanol;

            // Add to history
            if (!station.priceHistory) station.priceHistory = [];
            station.priceHistory.push({
                date: new Date().toLocaleDateString(undefined, { day: '2-digit', month: '2-digit'}),
                gas,
                ethanol
            });

            this.addPoints(10); // 10 points for update
        }
    }

    @action addPoints = (amount: number) => {
        this.points += amount;
    }
}

const stationsStore = new StationsStore();
export { stationsStore };
