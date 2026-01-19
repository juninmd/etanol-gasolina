
import { stationsStore } from '../stations.store';

describe('StationsStore', () => {

    beforeEach(() => {
        stationsStore.favorites = [];
        stationsStore.filterPromo = false;
        stationsStore.stations = [
            {
                id: 1,
                name: 'Posto A',
                address: 'Address A',
                priceGas: 5.00,
                priceEthanol: 3.50, // 0.7
                latitude: 0,
                longitude: 0,
                isPromo: true,
                comments: []
            },
            {
                id: 2,
                name: 'Posto B',
                address: 'Address B',
                priceGas: 5.00,
                priceEthanol: 4.00, // 0.8
                latitude: 0,
                longitude: 0,
                isPromo: false,
                comments: []
            }
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
        stationsStore.updatePrice(1, 6.00, 4.00);
        const station = stationsStore.stations.find(s => s.id === 1);
        expect(station?.priceGas).toBe(6.00);
        expect(station?.priceEthanol).toBe(4.00);
    });

    it('should add comment', () => {
        stationsStore.addComment(1, 'Nice!');
        const station = stationsStore.stations.find(s => s.id === 1);
        expect(station?.comments.length).toBe(1);
        expect(station?.comments[0].text).toBe('Nice!');
    });
});
