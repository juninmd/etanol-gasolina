import {stationsStore} from '../stations.store';

describe('StationsStore', () => {
  beforeEach(() => {
    stationsStore.favorites = [];
    stationsStore.filterPromo = false;
    stationsStore.stations = [
      {
        id: 1,
        name: 'Posto A',
        address: 'Address A',
        priceGas: 5.0,
        priceEthanol: 3.5, // 0.7
        latitude: 0,
        longitude: 0,
        isPromo: true,
        comments: [],
        priceTrend: 'down'
      },
      {
        id: 2,
        name: 'Posto B',
        address: 'Address B',
        priceGas: 5.0,
        priceEthanol: 4.0, // 0.8
        latitude: 0,
        longitude: 0,
        isPromo: false,
        comments: [],
        priceTrend: 'up'
      },
    ];
  });

  it('should toggle favorite status', () => {
    expect(stationsStore.isFavorite(1)).toBe(false);
    stationsStore.toggleFavorite(1);
    expect(stationsStore.isFavorite(1)).toBe(true);
    stationsStore.toggleFavorite(1);
    expect(stationsStore.isFavorite(1)).toBe(false);
  });

  it('should filter by promo', () => {
    expect(stationsStore.filteredStations.length).toBe(2);
    stationsStore.toggleFilterPromo();
    expect(stationsStore.filterPromo).toBe(true);
    expect(stationsStore.filteredStations.length).toBe(1);
    expect(stationsStore.filteredStations[0].id).toBe(1);
  });

  it('should update price', () => {
    stationsStore.updatePrice(1, 6.0, 4.0);
    const station = stationsStore.stations.find(function(s) {
      return s.id === 1;
    });
    expect(station && station.priceGas).toBe(6.0);
    expect(station && station.priceEthanol).toBe(4.0);
  });

  it('should add comment', () => {
    stationsStore.addComment(1, 'Nice!', 5);
    const station = stationsStore.stations.find(function(s) {
      return s.id === 1;
    });
    expect(station && station.comments.length).toBe(1);
    expect(station && station.comments[0].text).toBe('Nice!');
    expect(station && station.comments[0].rating).toBe(5);
  });

  it('should verify price and log activity', () => {
    const initialCount = stationsStore.stations[0].verificationsCount || 0;
    stationsStore.verifyPrice(1);
    const station = stationsStore.stations.find(function(s) {
      return s.id === 1;
    });
    expect(station && station.verificationsCount).toBe(initialCount + 1);

    expect(stationsStore.recentActivities.length).toBeGreaterThan(0);
    expect(stationsStore.recentActivities[0].type).toBe('verification');
    expect(stationsStore.recentActivities[0].stationId).toBe(1);
  });

  describe('Gamification', () => {
    it('should calculate levels correctly', () => {
      stationsStore.points = 0;
      expect(stationsStore.level).toBe('Novato');
      expect(stationsStore.progress).toBe(0);
      expect(stationsStore.nextLevelPoints).toBe(200);

      stationsStore.points = 100;
      expect(stationsStore.level).toBe('Novato');
      expect(stationsStore.progress).toBe(0.5);

      stationsStore.points = 200;
      expect(stationsStore.level).toBe('Explorador');
      expect(stationsStore.progress).toBe(0);
      expect(stationsStore.nextLevelPoints).toBe(500);

      stationsStore.points = 350;
      expect(stationsStore.progress).toBe(0.5);

      stationsStore.points = 500;
      expect(stationsStore.level).toBe('Mestre');
      expect(stationsStore.progress).toBe(0);
    });
  });

  describe('Market Analysis', () => {
    it('should return default values if no stations', () => {
      stationsStore.stations = [];
      const analysis = stationsStore.marketAnalysis;
      expect(analysis.ratio).toBe(0);
      expect(analysis.bestFuel).toBe('Gasoline'); // Default safety
    });

    it('should recommend Ethanol when ratio < 0.7', () => {
      stationsStore.stations = [
        {...stationsStore.stations[0], priceGas: 5.0, priceEthanol: 3.0}, // Ratio 0.6
      ];
      const analysis = stationsStore.marketAnalysis;
      expect(analysis.ratio).toBe(0.6);
      expect(analysis.bestFuel).toBe('Ethanol');
      // Savings: (0.7 - 0.6)/0.7 = 0.1/0.7 = ~14.2%
      expect(analysis.potentialSavingsPct).toBeCloseTo(14.3, 1);
    });

    it('should recommend Gasoline when ratio > 0.7', () => {
      stationsStore.stations = [
        {...stationsStore.stations[0], priceGas: 5.0, priceEthanol: 4.0}, // Ratio 0.8
      ];
      const analysis = stationsStore.marketAnalysis;
      expect(analysis.ratio).toBe(0.8);
      expect(analysis.bestFuel).toBe('Gasoline');
      expect(analysis.potentialSavingsPct).toBe(0);
    });

    it('should calculate global market advice', () => {
      stationsStore.stations = [
        {...stationsStore.stations[0], priceTrend: 'down'},
        {...stationsStore.stations[1], priceTrend: 'down'}
      ];
      expect(stationsStore.globalMarketAdvice).toBe('Preços em queda! Aproveite para encher o tanque.');

      stationsStore.stations = [
        {...stationsStore.stations[0], priceTrend: 'up'},
        {...stationsStore.stations[1], priceTrend: 'up'}
      ];
      expect(stationsStore.globalMarketAdvice).toBe('Preços subindo! Melhor abastecer logo.');

      stationsStore.stations = [
        {...stationsStore.stations[0], priceTrend: 'stable'}
      ];
      expect(stationsStore.globalMarketAdvice).toBe('Mercado estável hoje.');

      stationsStore.stations = [];
      expect(stationsStore.globalMarketAdvice).toBe('Sem dados suficientes.');
    });
  });

  describe('Savings and Badges', () => {
     it('should add savings and trigger badges', () => {
        stationsStore.totalSavings = 0;
        stationsStore.addSavings(60);
        expect(stationsStore.totalSavings).toBe(60);
        expect(stationsStore.badges.find(b => b.id === 'saver')?.unlocked).toBe(true);
     });

     it('should dismiss checkin', () => {
        stationsStore.checkinStation = stationsStore.stations[0];
        stationsStore.dismissCheckin();
        expect(stationsStore.checkinStation).toBeNull();
     });

     it('should handle daily challenge', () => {
         stationsStore.dailyChallenge = {
             task: 'Verifique 1 preço hoje',
             progress: 0,
             target: 1,
             completed: false,
             reward: 50
         };
         stationsStore.checkDailyChallenge('verify');
         expect(stationsStore.dailyChallenge.completed).toBe(true);
         expect(stationsStore.dailyChallenge.progress).toBe(1);

         stationsStore.dailyChallenge = {
             task: 'Avalie 1 posto hoje',
             progress: 0,
             target: 1,
             completed: false,
             reward: 30
         };
         stationsStore.checkDailyChallenge('comment');
         expect(stationsStore.dailyChallenge.completed).toBe(true);
         expect(stationsStore.dailyChallenge.progress).toBe(1);

         stationsStore.dailyChallenge = {
             task: 'Economize dinheiro',
             progress: 0,
             target: 1,
             completed: false,
             reward: 100
         };
         stationsStore.checkDailyChallenge('savings');
         expect(stationsStore.dailyChallenge.completed).toBe(true);
         expect(stationsStore.dailyChallenge.progress).toBe(1);

         // Already completed
         stationsStore.dailyChallenge.progress = 0;
         stationsStore.checkDailyChallenge('savings');
         expect(stationsStore.dailyChallenge.progress).toBe(0);
     });

     it('should trigger and clear alerts', () => {
         stationsStore.triggerAlert('Test', 'success');
         expect(stationsStore.smartAlert.message).toBe('Test');
         expect(stationsStore.smartAlert.type).toBe('success');

         stationsStore.clearAlert();
         expect(stationsStore.smartAlert.message).toBeNull();
         expect(stationsStore.smartAlert.type).toBe('info');
     });

     it('should handle level up reset', () => {
         stationsStore.showLevelUp = true;
         stationsStore.resetLevelUp();
         expect(stationsStore.showLevelUp).toBe(false);
     });

     it('should handle badge popup reset', () => {
         stationsStore.badgeQueue = [{id: 'test', name: 'Test', description: 'test', icon: 'test', unlocked: true}];
         stationsStore.resetBadgePopup();
         expect(stationsStore.badgeQueue.length).toBe(0);

         stationsStore.resetBadgePopup();
         expect(stationsStore.badgeQueue.length).toBe(0);
     });

     it('should check influencer badge', () => {
         stationsStore.recentActivities = [
             {id: 1, type: 'comment', text: 'test', author: 'Você', timestamp: 0},
             {id: 2, type: 'comment', text: 'test', author: 'Você', timestamp: 0},
             {id: 3, type: 'comment', text: 'test', author: 'Você', timestamp: 0},
             {id: 4, type: 'comment', text: 'test', author: 'Você', timestamp: 0},
             {id: 5, type: 'comment', text: 'test', author: 'Você', timestamp: 0},
         ];

         // Mock un-unlock influencer badge
         const influencerBadge = stationsStore.badges.find(b => b.id === 'influencer');
         if (influencerBadge) influencerBadge.unlocked = false;

         stationsStore.checkBadges('comment');
         expect(stationsStore.badges.find(b => b.id === 'influencer')?.unlocked).toBe(true);
     });

     it('should check bicycle badge', () => {
         // Mock un-unlock bicycle badge
         const bicycleBadge = stationsStore.badges.find(b => b.id === 'bicycle_secret');
         if (bicycleBadge) bicycleBadge.unlocked = false;

         stationsStore.checkBadges('bicycle');
         expect(stationsStore.badges.find(b => b.id === 'bicycle_secret')?.unlocked).toBe(true);
     });
  });
});
