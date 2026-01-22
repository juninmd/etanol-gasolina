import { garageStore } from '../garage.store';

describe('GarageStore', () => {
    beforeEach(() => {
        // Reset logs and vehicles for test isolation if needed,
        // but since it's a singleton we need to be careful.
        // For this basic test we will just add new data.
        garageStore.vehicles = [];
        garageStore.logs = [];
        garageStore.selectedVehicleId = null;
    });

    it('should add a vehicle', () => {
        garageStore.addVehicle({
            name: 'Test Car',
            tankCapacity: 50,
            avgGasConsumption: 10,
            avgEthanolConsumption: 7
        });

        expect(garageStore.vehicles.length).toBe(1);
        expect(garageStore.vehicles[0].name).toBe('Test Car');
        expect(garageStore.selectedVehicleId).toBe(garageStore.vehicles[0].id);
    });

    it('should select a vehicle', () => {
         garageStore.addVehicle({
            name: 'Car 1',
            tankCapacity: 50,
            avgGasConsumption: 10,
            avgEthanolConsumption: 7
        });
        garageStore.addVehicle({
            name: 'Car 2',
            tankCapacity: 50,
            avgGasConsumption: 12,
            avgEthanolConsumption: 8
        });

        const id2 = garageStore.vehicles[1].id;
        garageStore.selectVehicle(id2);
        expect(garageStore.selectedVehicleId).toBe(id2);
        expect(garageStore.selectedVehicle?.name).toBe('Car 2');
    });

    it('should add a log', () => {
        garageStore.addVehicle({
            name: 'Test Car',
            tankCapacity: 50,
            avgGasConsumption: 10,
            avgEthanolConsumption: 7
        });
        const vehicleId = garageStore.vehicles[0].id;
        garageStore.selectedVehicleId = vehicleId;

        garageStore.addLog({
            vehicleId,
            stationName: 'Test Station',
            fuelType: 'gas',
            pricePerLiter: 5.0,
            liters: 20,
            odometer: 1000,
            date: '2023-10-01'
        });

        expect(garageStore.logs.length).toBe(1);
        expect(garageStore.logs[0].totalCost).toBe(100); // 5.0 * 20
    });

    it('should calculate stats correctly', () => {
        garageStore.addVehicle({
            name: 'Test Car',
            tankCapacity: 50,
            avgGasConsumption: 10,
            avgEthanolConsumption: 7
        });
        const vehicleId = garageStore.vehicles[0].id;
        garageStore.selectedVehicleId = vehicleId;

        garageStore.addLog({
            vehicleId,
            stationName: 'Station 1',
            fuelType: 'gas',
            pricePerLiter: 5.0,
            liters: 20,
            odometer: 1000,
            date: '2023-10-01'
        });

        garageStore.addLog({
            vehicleId,
            stationName: 'Station 2',
            fuelType: 'ethanol',
            pricePerLiter: 3.5,
            liters: 30,
            odometer: 1300,
            date: '2023-10-05'
        });

        // Add a log for another vehicle (should be ignored)
        garageStore.addLog({
            vehicleId: 'other_vehicle',
            stationName: 'Station 3',
            fuelType: 'gas',
            pricePerLiter: 6.0,
            liters: 10,
            odometer: 500,
            date: '2023-10-06'
        });

        const stats = garageStore.fuelStats;

        expect(garageStore.totalSpent).toBe(100 + 105); // 100 (gas) + 105 (eth)
        expect(stats.totalGasLiters).toBe(20);
        expect(stats.totalEthLiters).toBe(30);
        expect(stats.avgPriceGas).toBe(5.0);
        expect(stats.avgPriceEth).toBe(3.5);
    });

    it('should update vehicle stats', () => {
         garageStore.addVehicle({
            name: 'Test Car',
            tankCapacity: 50,
            avgGasConsumption: 10,
            avgEthanolConsumption: 7
        });
        const id = garageStore.vehicles[0].id;

        garageStore.updateVehicleStats(id, 11, 7.5);

        expect(garageStore.vehicles[0].avgGasConsumption).toBe(11);
        expect(garageStore.vehicles[0].avgEthanolConsumption).toBe(7.5);
    });
});
