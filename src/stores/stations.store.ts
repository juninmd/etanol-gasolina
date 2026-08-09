import {action, observable, computed, runInAction} from 'mobx';
import {homeStore} from './home.store';
import {garageStore} from './garage.store';
import {fetchLivePrices} from '../services/api.service';

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

export interface MarketAnalysis {
  avgGas: number;
  avgEthanol: number;
  ratio: number;
  bestFuel: 'Ethanol' | 'Gasoline';
  potentialSavingsPct: number;
}

export interface SavingsRecord {
  id: string;
  date: string;
  amount: number;
  stationId?: number;
}

export interface SmartAlert {
  message: string | null;
  type: 'success' | 'info' | 'warning';
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
  priceHistory: {date: string; gas: number; ethanol: number}[];
  lastVerified?: string;
  verificationsCount?: number;
  priceTrend?: 'up' | 'down' | 'stable';
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
        {
          id: 1,
          text: 'Ótimo atendimento!',
          author: 'João',
          date: '10/05/2023',
          rating: 5,
        },
      ],
      priceHistory: [
        {date: '01/05', gas: 5.49, ethanol: 3.69},
        {date: '05/05', gas: 5.55, ethanol: 3.75},
        {date: '10/05', gas: 5.59, ethanol: 3.79},
      ],
      lastVerified: new Date().toISOString(),
      verificationsCount: 12,
      priceTrend: 'up',
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
        {date: '01/05', gas: 5.39, ethanol: 3.79},
        {date: '10/05', gas: 5.49, ethanol: 3.89},
      ],
      lastVerified: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      verificationsCount: 3,
      priceTrend: 'down',
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
      verificationsCount: 0,
      priceTrend: 'stable',
    },
  ];

  @observable recentActivities: Activity[] = [
    {
      id: 1,
      type: 'savings',
      text: 'economizou R$ 15,00',
      author: 'Maria S.',
      timestamp: Date.now() - 300000,
    },
    {
      id: 2,
      type: 'price_update',
      text: 'atualizou preços no Posto Ipiranga',
      author: 'Carlos A.',
      timestamp: Date.now() - 900000,
      stationId: 1,
    },
    {
      id: 3,
      type: 'verification',
      text: 'confirmou preços no Posto Shell',
      author: 'Roberto F.',
      timestamp: Date.now() - 3600000,
      stationId: 2,
    },
  ];

  @observable favorites: number[] = [];
  @observable filterPromo = false;
  @observable totalSavings = 0;
  @observable totalCO2Saved = 0; // in kg
  @observable savingsHistory: SavingsRecord[] = [];

  @computed get treesPlanted() {
    // Approx 20kg of CO2 per tree
    return Math.floor(this.totalCO2Saved / 20);
  }
  @observable points = 150; // Initial gamification points
  @observable checkinStation: Station | null = null;
  @observable showLevelUp = false;
  @observable newLevelName = '';
  @observable smartAlert: SmartAlert = {message: null, type: 'info'};

  @observable badges: Badge[] = [
    {
      id: 'first_collab',
      name: 'Voz da Comunidade',
      description: 'Primeira contribuição feita',
      icon: 'message-circle-outline',
      unlocked: false,
    },
    {
      id: 'price_watcher',
      name: 'Fiscal de Preço',
      description: 'Atualizou um preço',
      icon: 'pricetags-outline',
      unlocked: false,
    },
    {
      id: 'saver',
      name: 'Poupador Nato',
      description: 'Economizou mais de R$ 50,00',
      icon: 'trending-up-outline',
      unlocked: false,
    },
    {
      id: 'influencer',
      name: 'Influenciador',
      description: 'Realizou 5 atividades na comunidade',
      icon: 'star-outline',
      unlocked: false,
    },
    {
      id: 'bicycle_secret',
      name: 'Atleta Sustentável',
      description: 'Descobriu a economia máxima: andar de bicicleta!',
      icon: 'bicycle-outline',
      unlocked: false,
    },
    {
      id: 'churrasqueiro',
      name: 'Mestre Churrasqueiro',
      description: 'Descobriu o Churrascómetro secreto!',
      icon: 'star-outline',
      unlocked: false,
    },
    {
      id: 'smart_commuter',
      name: 'Smart Commuter',
      description: 'Descobriu a funcionalidade Me Surpreenda: Vou de quê?',
      icon: 'car-outline',
      unlocked: false,
    },
    {
      id: 'sortudo',
      name: 'Sortudo da Roleta',
      description: 'Tirou a sorte grande na roleta de descontos',
      icon: 'star',
      unlocked: false,
    },
    {
      id: 'trunfo_master',
      name: 'Mestre do Trunfo',
      description: 'Ganhou uma partida épica na Batalha de Postos!',
      icon: 'flash-outline',
      unlocked: false,
    },
    {
      id: 'surpreendido',
      name: 'Caçador de Surpresas',
      description: 'Encontrou o botão secreto Me Surpreenda!',
      icon: 'gift-outline',
      unlocked: false,
    },
  ];
  @observable badgeQueue: Badge[] = [];

  @observable dailyChallenge = {
    task: 'Verifique 1 preço hoje',
    progress: 0,
    target: 1,
    completed: false,
    reward: 50,
  };

  @computed get currentBadge() {
    return this.badgeQueue.length > 0 ? this.badgeQueue[0] : null;
  }

  constructor() {
    // Desabilitado para versão de produção - requer backend
    this.startRealTimeUpdates();
    this.startGeofenceSimulation();
    this.initDailyChallenge();
  }

  initDailyChallenge() {
    const challenges = [
      {task: 'Verifique 1 preço hoje', target: 1, reward: 50},
      {task: 'Avalie 1 posto hoje', target: 1, reward: 30},
      {task: 'Economize dinheiro', target: 1, reward: 100},
    ];
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    this.dailyChallenge = {...challenge, progress: 0, completed: false};
  }

  @action checkDailyChallenge = (actionType: string) => {
    if (this.dailyChallenge.completed) {
      return;
    }

    let progressMade = false;

    if (
      this.dailyChallenge.task.includes('Verifique') &&
      ['verify', 'update'].includes(actionType)
    ) {
      this.dailyChallenge.progress += 1;
      progressMade = true;
    } else if (
      this.dailyChallenge.task.includes('Avalie') &&
      actionType === 'comment'
    ) {
      this.dailyChallenge.progress += 1;
      progressMade = true;
    } else if (
      this.dailyChallenge.task.includes('Economize') &&
      actionType === 'savings'
    ) {
      this.dailyChallenge.progress += 1;
      progressMade = true;
    }

    if (
      progressMade &&
      this.dailyChallenge.progress >= this.dailyChallenge.target
    ) {
      this.dailyChallenge.completed = true;
      this.addPoints(this.dailyChallenge.reward);
      this.triggerAlert(
        `Desafio Completo! +${this.dailyChallenge.reward} pontos`,
        'success',
      );
    }
  };

  startRealTimeUpdates() {
    // Fetches real-time price updates from an API
    setInterval(async () => {
      try {
        const stationIds = this.stations.map((s) => s.id);
        const updates = await fetchLivePrices(stationIds);

        runInAction(() => {
          updates.forEach((update) => {
            const station = this.stations.find(
              (s) => s.id === update.stationId,
            );
            if (
              station &&
              (update.priceGas !== 0 || update.priceEthanol !== 0)
            ) {
              station.priceTrend = update.trend;

              const oldPrice = station.priceGas;
              station.priceGas = Math.max(
                3.0,
                Math.round((station.priceGas + update.priceGas) * 100) / 100,
              );
              station.priceEthanol = Math.max(
                2.0,
                Math.round((station.priceEthanol + update.priceEthanol) * 100) /
                  100,
              );

              if (update.isPromo && !station.isPromo) {
                station.isPromo = true;
              } else if (station.priceGas > oldPrice + 0.05) {
                station.isPromo = false;
              }

              // Smart Alert for Promo / Price Drop
              if (update.isPromo && station.priceGas < oldPrice) {
                this.triggerAlert(
                  `📢 Nova Promoção! ${
                    station.name
                  } abaixou a gasolina para R$ ${station.priceGas.toFixed(2)}`,
                  'success',
                );
              }
            }
          });
        });
      } catch (e) {
        console.error('Failed to fetch live prices', e);
      }
    }, 10000); // Check every 10 seconds
  }

  startGeofenceSimulation() {
    // Simulates detecting that the user is near a station (Geofencing)
    const trigger = () => {
      if (!this.checkinStation) {
        runInAction(() => {
          // Randomly pick a station to "be at"
          this.checkinStation =
            this.stations[Math.floor(secureRandom() * this.stations.length)];
        });
      }
    };

    setTimeout(trigger, 8000); // Initial check
    setInterval(trigger, 60000); // Recurring check
  }

  @action dismissCheckin = () => {
    this.checkinStation = null;
  };

  @computed get level() {
    if (this.points < 200) {
      return 'Novato';
    }
    if (this.points < 500) {
      return 'Explorador';
    }
    return 'Mestre';
  }

  @computed get nextLevelPoints() {
    if (this.points < 200) {
      return 200;
    }
    if (this.points < 500) {
      return 500;
    }
    return 1000; // Cap or next huge milestone
  }

  @computed get progress() {
    if (this.points < 200) {
      return this.points / 200;
    }
    if (this.points < 500) {
      return (this.points - 200) / 300;
    }
    return Math.min(1, (this.points - 500) / 500);
  }

  @computed get globalMarketAdvice() {
    const upCount = this.stations.filter((s) => s.priceTrend === 'up').length;
    const downCount = this.stations.filter(
      (s) => s.priceTrend === 'down',
    ).length;
    const total = this.stations.length;

    if (total === 0) {
      return 'Sem dados suficientes.';
    }
    if (downCount > upCount && downCount > 0) {
      return 'Preços em queda! Aproveite para encher o tanque.';
    }
    if (upCount > downCount && upCount > 0) {
      return 'Preços subindo! Melhor abastecer logo.';
    }
    return 'Mercado estável hoje.';
  }

  @computed get filteredStations() {
    if (this.filterPromo) {
      return this.stations.filter((s) => s.isPromo);
    }
    return this.stations;
  }

  @computed get marketAnalysis(): MarketAnalysis {
    const count = this.stations.length;
    if (count === 0) {
      return {
        avgGas: 0,
        avgEthanol: 0,
        ratio: 0,
        bestFuel: 'Gasoline',
        potentialSavingsPct: 0,
      };
    }

    const totalGas = this.stations.reduce((sum, s) => sum + s.priceGas, 0);
    const totalEthanol = this.stations.reduce(
      (sum, s) => sum + s.priceEthanol,
      0,
    );

    const avgGas = totalGas / count;
    const avgEthanol = totalEthanol / count;

    const ratio = avgGas > 0 ? avgEthanol / avgGas : 0;

    // Determine Break-Even Ratio based on Vehicle or Standard
    let breakEvenRatio = 0.7;
    let etanolCons = parseFloat(homeStore.etanolConsumption.replace(',', '.'));
    let gasCons = parseFloat(homeStore.gasolinaConsumption.replace(',', '.'));

    // Fallback to Garage Store
    if ((isNaN(etanolCons) || etanolCons <= 0) && garageStore.selectedVehicle) {
      etanolCons = garageStore.selectedVehicle.avgEthanolConsumption;
    }
    if ((isNaN(gasCons) || gasCons <= 0) && garageStore.selectedVehicle) {
      gasCons = garageStore.selectedVehicle.avgGasConsumption;
    }

    if (
      !isNaN(etanolCons) &&
      !isNaN(gasCons) &&
      etanolCons > 0 &&
      gasCons > 0
    ) {
      breakEvenRatio = etanolCons / gasCons;
    }

    const bestFuel = ratio < breakEvenRatio ? 'Ethanol' : 'Gasoline';

    // Calculate potential savings
    let potentialSavingsPct = 0;
    if (bestFuel === 'Ethanol') {
      potentialSavingsPct = ((breakEvenRatio - ratio) / breakEvenRatio) * 100;
    } else {
      potentialSavingsPct = 0; // Baseline
    }

    return {
      avgGas,
      avgEthanol,
      ratio,
      bestFuel,
      potentialSavingsPct: Math.max(
        0,
        parseFloat(potentialSavingsPct.toFixed(1)),
      ),
    };
  }

  @computed get bestStation() {
    if (this.stations.length === 0) {
      return null;
    }

    let etanolCons = parseFloat(homeStore.etanolConsumption.replace(',', '.'));
    let gasCons = parseFloat(homeStore.gasolinaConsumption.replace(',', '.'));

    // Fallback to Garage Store if inputs are empty/invalid
    if ((isNaN(etanolCons) || etanolCons <= 0) && garageStore.selectedVehicle) {
      etanolCons = garageStore.selectedVehicle.avgEthanolConsumption;
    }
    if ((isNaN(gasCons) || gasCons <= 0) && garageStore.selectedVehicle) {
      gasCons = garageStore.selectedVehicle.avgGasConsumption;
    }

    const useCustomCons =
      !isNaN(etanolCons) && !isNaN(gasCons) && etanolCons > 0 && gasCons > 0;

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
  };

  @action toggleFavorite = (id: number) => {
    if (this.favorites.includes(id)) {
      this.favorites = this.favorites.filter((favId) => favId !== id);
    } else {
      this.favorites.push(id);
    }
  };

  @action isFavorite = (id: number) => {
    return this.favorites.includes(id);
  };

  @action addComment = (stationId: number, text: string, rating: number) => {
    const station = this.stations.find((s) => s.id === stationId);
    if (station) {
      station.comments.push({
        id: Date.now(),
        text,
        author: 'Você',
        date: new Date().toLocaleDateString(),
        rating,
      });
      this.addActivity('comment', `avaliou ${station.name}`, stationId);
      this.addPoints(5); // 5 points for comment
      this.checkBadges('comment');
      this.checkDailyChallenge('comment');
    }
  };

  @action updatePrice = (stationId: number, gas: number, ethanol: number) => {
    const station = this.stations.find((s) => s.id === stationId);
    if (station) {
      station.priceGas = gas;
      station.priceEthanol = ethanol;
      station.lastVerified = new Date().toISOString();
      station.verificationsCount = (station.verificationsCount || 0) + 1;

      // Add to history
      if (!station.priceHistory) {
        station.priceHistory = [];
      }
      station.priceHistory.push({
        date: new Date().toLocaleDateString(undefined, {
          day: '2-digit',
          month: '2-digit',
        }),
        gas,
        ethanol,
      });

      this.addActivity(
        'price_update',
        `atualizou preços em ${station.name}`,
        stationId,
      );
      this.addPoints(10); // 10 points for update
      this.checkBadges('update');
      this.checkDailyChallenge('update');
    }
  };

  @action verifyPrice = (stationId: number) => {
    const station = this.stations.find((s) => s.id === stationId);
    if (station) {
      station.lastVerified = new Date().toISOString();
      station.verificationsCount = (station.verificationsCount || 0) + 1;

      this.addActivity(
        'verification',
        `confirmou o preço em ${station.name}`,
        stationId,
      );
      this.addPoints(5); // 5 points for verification
      this.checkBadges('verify');
      this.checkDailyChallenge('verify');
    }
  };

  @action addActivity = (
    type: Activity['type'],
    text: string,
    stationId?: number,
  ) => {
    this.recentActivities.unshift({
      id: Date.now(),
      type,
      text,
      author: 'Você',
      timestamp: Date.now(),
      stationId,
    });
    if (this.recentActivities.length > 10) {
      this.recentActivities.pop();
    }
  };

  @action addPoints = (amount: number) => {
    const oldLevel = this.level;
    this.points += amount;
    if (this.level !== oldLevel) {
      this.newLevelName = this.level;
      this.showLevelUp = true;
    }
  };

  @action addSavings = (amount: number) => {
    this.totalSavings += amount;
    // Mock: for every R$ 1 saved, we saved ~0.5kg of CO2 by using Ethanol
    this.totalCO2Saved += amount * 0.5;

    this.savingsHistory.push({
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      amount,
    });
    this.addPoints(Math.floor(amount * 2));
    this.checkBadges('savings');
    this.checkDailyChallenge('savings');
  };

  @action triggerAlert = (
    message: string,
    type: 'success' | 'info' | 'warning' = 'info',
  ) => {
    this.smartAlert = {message, type};
  };

  @action clearAlert = () => {
    this.smartAlert = {message: null, type: 'info'};
  };

  @action checkBadges = (actionType: string) => {
    // First Collaboration Badge
    if (['comment', 'update', 'verify'].includes(actionType)) {
      const badge = this.badges.find((b) => b.id === 'first_collab');
      if (badge && !badge.unlocked) {
        badge.unlocked = true;
        this.badgeQueue.push(badge);
      }
    }

    // Price Watcher
    if (actionType === 'update') {
      const badge = this.badges.find((b) => b.id === 'price_watcher');
      if (badge && !badge.unlocked) {
        badge.unlocked = true;
        this.badgeQueue.push(badge);
      }
    }

    // Saver
    if (this.totalSavings >= 50) {
      const badge = this.badges.find((b) => b.id === 'saver');
      if (badge && !badge.unlocked) {
        badge.unlocked = true;
        this.badgeQueue.push(badge);
      }
    }

    // Influencer
    // Count activities by 'Você'
    const myActivities = this.recentActivities.filter(
      (a) => a.author === 'Você',
    ).length;
    if (myActivities >= 5) {
      const badge = this.badges.find((b) => b.id === 'influencer');
      if (badge && !badge.unlocked) {
        badge.unlocked = true;
        this.badgeQueue.push(badge);
      }
    }

    // Bicycle Secret
    if (actionType === 'bicycle') {
      const badge = this.badges.find((b) => b.id === 'bicycle_secret');
      if (badge && !badge.unlocked) {
        badge.unlocked = true;
        this.badgeQueue.push(badge);
      }
    }
  };

  @action resetLevelUp = () => {
    this.showLevelUp = false;
  };

  @action unlockSurpresaBadge = () => {
    const badge = this.badges.find((b) => b.id === 'surpreendido');
    if (badge && !badge.unlocked) {
      badge.unlocked = true;
      this.badgeQueue.push(badge);
    }
  };

  @action unlockSortudoBadge = () => {
    const badge = this.badges.find((b) => b.id === 'sortudo');
    if (badge && !badge.unlocked) {
      badge.unlocked = true;
      this.badgeQueue.push(badge);
    }
  };

  @action unlockTrunfoBadge = () => {
    const badge = this.badges.find((b) => b.id === 'trunfo_master');
    if (badge && !badge.unlocked) {
      badge.unlocked = true;
      this.badgeQueue.push(badge);
    }
  };

  @action resetBadgePopup = () => {
    if (this.badgeQueue.length > 0) {
      this.badgeQueue.shift();
    }
  };
}

const stationsStore = new StationsStore();
export {stationsStore};
