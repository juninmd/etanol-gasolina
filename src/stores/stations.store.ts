import { action, observable, computed, runInAction } from 'mobx';
import { homeStore } from './home.store';

export interface Comment {
    id: number;
    text: string;
    author: string;
    date: string;
    rating: number;
}

export interface Activity {
    id: number;
    type: 'price_update' | 'verification' | 'comment' | 'savings';
    text: string;
    author: string;
    timestamp: number;
    stationId?: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
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
    lastVerified?: string;
    verificationsCount?: number;
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
                { id: 1, text: 'Ótimo atendimento!', author: 'João', date: '10/05/2023', rating: 5 }
            ],
            priceHistory: [
                { date: '01/05', gas: 5.49, ethanol: 3.69 },
                { date: '05/05', gas: 5.55, ethanol: 3.75 },
                { date: '10/05', gas: 5.59, ethanol: 3.79 },
            ],
            lastVerified: new Date().toISOString(),
            verificationsCount: 12
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
            ],
            lastVerified: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
            verificationsCount: 3
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
            priceHistory: [],
            lastVerified: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
            verificationsCount: 0
        }
    ];

    @observable recentActivities: Activity[] = [
        { id: 1, type: 'savings', text: 'economizou R$ 15,00', author: 'Maria S.', timestamp: Date.now() - 300000 },
        { id: 2, type: 'price_update', text: 'atualizou preços no Posto Ipiranga', author: 'Carlos A.', timestamp: Date.now() - 900000, stationId: 1 },
        { id: 3, type: 'verification', text: 'confirmou preços no Posto Shell', author: 'Roberto F.', timestamp: Date.now() - 3600000, stationId: 2 },
    ];

    @observable favorites: number[] = [];
    @observable filterPromo = false;
    @observable totalSavings = 0;
    @observable points = 150; // Initial gamification points
    @observable checkinStation: Station | null = null;
    @observable showLevelUp = false;
    @observable newLevelName = '';

    @observable badges: Badge[] = [
        { id: 'first_collab', name: 'Voz da Comunidade', description: 'Primeira contribuição feita', icon: 'message-circle-outline', unlocked: false },
        { id: 'price_watcher', name: 'Fiscal de Preço', description: 'Atualizou um preço', icon: 'pricetags-outline', unlocked: false },
        { id: 'saver', name: 'Poupador Nato', description: 'Economizou mais de R$ 50,00', icon: 'trending-up-outline', unlocked: false },
        { id: 'influencer', name: 'Influenciador', description: 'Realizou 5 atividades na comunidade', icon: 'star-outline', unlocked: false }
    ];
    @observable badgeQueue: Badge[] = [];

    @computed get currentBadge() {
        return this.badgeQueue.length > 0 ? this.badgeQueue[0] : null;
    }

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

    @action addComment = (stationId: number, text: string, rating: number) => {
        const station = this.stations.find(s => s.id === stationId);
        if (station) {
            station.comments.push({
                id: Date.now(),
                text,
                author: 'Você',
                date: new Date().toLocaleDateString(),
                rating
            });
            this.addActivity('comment', `avaliou ${station.name}`, stationId);
            this.addPoints(5); // 5 points for comment
            this.checkBadges('comment');
        }
    }

    @action updatePrice = (stationId: number, gas: number, ethanol: number) => {
        const station = this.stations.find(s => s.id === stationId);
        if (station) {
            station.priceGas = gas;
            station.priceEthanol = ethanol;
            station.lastVerified = new Date().toISOString();
            station.verificationsCount = (station.verificationsCount || 0) + 1;

            // Add to history
            if (!station.priceHistory) station.priceHistory = [];
            station.priceHistory.push({
                date: new Date().toLocaleDateString(undefined, { day: '2-digit', month: '2-digit'}),
                gas,
                ethanol
            });

            this.addActivity('price_update', `atualizou preços em ${station.name}`, stationId);
            this.addPoints(10); // 10 points for update
            this.checkBadges('update');
        }
    }

    @action verifyPrice = (stationId: number) => {
        const station = this.stations.find(s => s.id === stationId);
        if (station) {
            station.lastVerified = new Date().toISOString();
            station.verificationsCount = (station.verificationsCount || 0) + 1;

            this.addActivity('verification', `confirmou o preço em ${station.name}`, stationId);
            this.addPoints(5); // 5 points for verification
            this.checkBadges('verify');
        }
    }

    @action addActivity = (type: Activity['type'], text: string, stationId?: number) => {
        this.recentActivities.unshift({
            id: Date.now(),
            type,
            text,
            author: 'Você',
            timestamp: Date.now(),
            stationId
        });
        if (this.recentActivities.length > 10) {
            this.recentActivities.pop();
        }
    }

    @action addPoints = (amount: number) => {
        const oldLevel = this.level;
        this.points += amount;
        if (this.level !== oldLevel) {
            this.newLevelName = this.level;
            this.showLevelUp = true;
        }
    }

    @action addSavings = (amount: number) => {
        this.totalSavings += amount;
        this.addPoints(Math.floor(amount * 2));
        this.checkBadges('savings');
    }

    @action checkBadges = (actionType: string) => {
        // First Collaboration Badge
        if (['comment', 'update', 'verify'].includes(actionType)) {
            const badge = this.badges.find(b => b.id === 'first_collab');
            if (badge && !badge.unlocked) {
                badge.unlocked = true;
                this.badgeQueue.push(badge);
            }
        }

        // Price Watcher
        if (actionType === 'update') {
            const badge = this.badges.find(b => b.id === 'price_watcher');
            if (badge && !badge.unlocked) {
                badge.unlocked = true;
                this.badgeQueue.push(badge);
            }
        }

        // Saver
        if (this.totalSavings >= 50) {
            const badge = this.badges.find(b => b.id === 'saver');
            if (badge && !badge.unlocked) {
                badge.unlocked = true;
                this.badgeQueue.push(badge);
            }
        }

        // Influencer
        // Count activities by 'Você'
        const myActivities = this.recentActivities.filter(a => a.author === 'Você').length;
        if (myActivities >= 5) {
             const badge = this.badges.find(b => b.id === 'influencer');
             if (badge && !badge.unlocked) {
                 badge.unlocked = true;
                 this.badgeQueue.push(badge);
             }
        }
    }

    @action resetLevelUp = () => {
        this.showLevelUp = false;
    }

    @action resetBadgePopup = () => {
        if (this.badgeQueue.length > 0) {
            this.badgeQueue.shift();
        }
    }
}

const stationsStore = new StationsStore();
export { stationsStore };
