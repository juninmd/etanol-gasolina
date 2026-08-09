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
    const station = stationsStore.stations.find(function (s) {
      return s.id === 1;
    });
    expect(station && station.priceGas).toBe(6.0);
    expect(station && station.priceEthanol).toBe(4.0);
  });

  it('should add comment', () => {
    stationsStore.addComment(1, 'Nice!', 5);
    const station = stationsStore.stations.find(function (s) {
      return s.id === 1;
    });
    expect(station && station.comments.length).toBe(1);
    expect(station && station.comments[0].text).toBe('Nice!');
    expect(station && station.comments[0].rating).toBe(5);
  });

  it('should verify price and log activity', () => {
    const initialCount = stationsStore.stations[0].verificationsCount || 0;
    stationsStore.verifyPrice(1);
    const station = stationsStore.stations.find(function (s) {
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
  });
});
