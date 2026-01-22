import { action, observable, computed } from 'mobx';

export interface Vehicle {
    id: string;
    name: string;
    tankCapacity: number; // liters
    avgGasConsumption: number; // km/l
    avgEthanolConsumption: number; // km/l
}

export interface FillLog {
    id: string;
    vehicleId: string;
    stationName: string;
    fuelType: 'gas' | 'ethanol';
    pricePerLiter: number;
    liters: number;
    totalCost: number;
    odometer: number;
    date: string;
}

export default class GarageStore {
    @observable vehicles: Vehicle[] = [
        {
            id: '1',
            name: 'Meu Carro',
            tankCapacity: 50,
            avgGasConsumption: 10,
            avgEthanolConsumption: 7
        }
    ];

    @observable logs: FillLog[] = [];
    @observable selectedVehicleId: string | null = '1';

    @computed get selectedVehicle() {
        return this.vehicles.find(v => v.id === this.selectedVehicleId) || null;
    }

    @computed get logsForSelectedVehicle() {
        return this.logs
            .filter(l => l.vehicleId === this.selectedVehicleId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    @computed get totalSpent() {
        return this.logsForSelectedVehicle.reduce((acc, log) => acc + log.totalCost, 0);
    }

    @computed get fuelStats() {
        const gasLogs = this.logsForSelectedVehicle.filter(l => l.fuelType === 'gas');
        const ethLogs = this.logsForSelectedVehicle.filter(l => l.fuelType === 'ethanol');

        return {
            totalGasLiters: gasLogs.reduce((acc, l) => acc + l.liters, 0),
            totalEthLiters: ethLogs.reduce((acc, l) => acc + l.liters, 0),
            avgPriceGas: gasLogs.length > 0 ? gasLogs.reduce((acc, l) => acc + l.pricePerLiter, 0) / gasLogs.length : 0,
            avgPriceEth: ethLogs.length > 0 ? ethLogs.reduce((acc, l) => acc + l.pricePerLiter, 0) / ethLogs.length : 0,
        };
    }

    @action addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
        const newVehicle = {
            ...vehicle,
            id: (Date.now() + Math.random()).toString()
        };
        this.vehicles.push(newVehicle);
        if (!this.selectedVehicleId) {
            this.selectedVehicleId = newVehicle.id;
        }
    }

    @action selectVehicle = (id: string) => {
        this.selectedVehicleId = id;
    }

    @action addLog = (log: Omit<FillLog, 'id' | 'totalCost'>) => {
        const newLog = {
            ...log,
            id: Date.now().toString(),
            totalCost: log.pricePerLiter * log.liters
        };
        this.logs.push(newLog);

        // Simulating "Learning" - Update average consumption slightly based on logs?
        // Real implementation would require odometer diffs between fills.
        // For now, let's just leave the consumption static or allow manual updates.
    }

    @action updateVehicleStats = (id: string, gasCons: number, ethCons: number) => {
        const vehicle = this.vehicles.find(v => v.id === id);
        if (vehicle) {
            vehicle.avgGasConsumption = gasCons;
            vehicle.avgEthanolConsumption = ethCons;
        }
    }
}

const garageStore = new GarageStore();
export { garageStore };
