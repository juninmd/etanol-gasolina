
import { homeStore } from '../home.store';

describe('HomeStore', () => {

    beforeEach(() => {
        homeStore.etanol = '';
        homeStore.gasolina = '';
        homeStore.etanolConsumption = '';
        homeStore.gasolinaConsumption = '';
        homeStore.resultado = '';
        homeStore.recommendation = '';
    });

    it('should calculate standard 70% rule correctly (Gas is better)', () => {
        homeStore.etanol = '4.00';
        homeStore.gasolina = '5.00'; // 4/5 = 0.8 (> 0.7)
        homeStore.calculate();
        expect(homeStore.recommendation).toBe('gas');
        expect(homeStore.resultado).toBe('Abasteça com Gasolina');
    });

    it('should calculate standard 70% rule correctly (Ethanol is better)', () => {
        homeStore.etanol = '3.00';
        homeStore.gasolina = '5.00'; // 3/5 = 0.6 (< 0.7)
        homeStore.calculate();
        expect(homeStore.recommendation).toBe('ethanol');
        expect(homeStore.resultado).toBe('Abasteça com Etanol');
    });

    it('should calculate standard 70% rule correctly (Equal)', () => {
        homeStore.etanol = '3.50';
        homeStore.gasolina = '5.00'; // 3.5/5 = 0.7
        homeStore.calculate();
        expect(homeStore.recommendation).toBe('equal');
        expect(homeStore.resultado).toBe('Tanto faz');
    });

    it('should use custom consumption if provided (Gas is better)', () => {
        homeStore.etanol = '3.00';
        homeStore.gasolina = '5.00';
        // If my car does 5km/l on ethanol and 10km/l on gas.
        // Cost per km Ethanol: 3/5 = 0.6
        // Cost per km Gas: 5/10 = 0.5
        // Gas is cheaper per km.
        homeStore.etanolConsumption = '5';
        homeStore.gasolinaConsumption = '10';
        homeStore.calculate();
        expect(homeStore.recommendation).toBe('gas');
    });

    it('should use custom consumption if provided (Ethanol is better)', () => {
        homeStore.etanol = '3.00';
        homeStore.gasolina = '5.00';
        // If my car does 8km/l on ethanol and 10km/l on gas.
        // Cost per km Ethanol: 3/8 = 0.375
        // Cost per km Gas: 5/10 = 0.5
        // Ethanol is cheaper per km.
        homeStore.etanolConsumption = '8';
        homeStore.gasolinaConsumption = '10';
        homeStore.calculate();
        expect(homeStore.recommendation).toBe('ethanol');
    });

    it('should handle invalid inputs gracefully', () => {
        homeStore.etanol = 'abc';
        homeStore.gasolina = '5.00';
        homeStore.calculate();
        expect(homeStore.resultado).toBe('');
    });
});
