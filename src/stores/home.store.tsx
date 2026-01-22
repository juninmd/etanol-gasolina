import { action, observable, computed } from 'mobx';
import { garageStore } from './garage.store';

export default class HomeStore {

  @observable etanol = '';
  @observable gasolina = '';
  @observable etanolConsumption = '';
  @observable gasolinaConsumption = '';
  @observable resultado = '';
  @observable recommendation: string = ''; // 'gas', 'ethanol', 'equal', ''

  @action calculate = () => {
    const etanolValue = parseFloat(this.etanol.replace(',', '.'));
    const gasolinaValue = parseFloat(this.gasolina.replace(',', '.'));
    const etanolCons = parseFloat(this.etanolConsumption.replace(',', '.'));
    const gasolinaCons = parseFloat(this.gasolinaConsumption.replace(',', '.'));

    if (!isNaN(etanolValue) && !isNaN(gasolinaValue) && gasolinaValue > 0) {
      let isEthanolBetter = false;
      let isEqual = false;

      // Use Garage Store vehicle if consumption is not manually overridden (empty)
      const useGarage = this.etanolConsumption === '' && this.gasolinaConsumption === '' && garageStore.selectedVehicle;

      let finalEtanolCons = etanolCons;
      let finalGasolinaCons = gasolinaCons;

      if (useGarage && garageStore.selectedVehicle) {
          finalEtanolCons = garageStore.selectedVehicle.avgEthanolConsumption;
          finalGasolinaCons = garageStore.selectedVehicle.avgGasConsumption;
      }

      if (!isNaN(finalEtanolCons) && !isNaN(finalGasolinaCons) && finalEtanolCons > 0 && finalGasolinaCons > 0) {
        // Calculate cost per km
        const costEthanol = etanolValue / finalEtanolCons;
        const costGas = gasolinaValue / finalGasolinaCons;

        if (costEthanol < costGas) isEthanolBetter = true;
        else if (costEthanol === costGas) isEqual = true;
      } else {
        // Standard 70% rule
        const value = etanolValue / gasolinaValue;
        if (value < 0.70) isEthanolBetter = true;
        else if (value === 0.70) isEqual = true;
      }

      if (isEqual) {
        this.resultado = 'Tanto faz';
        this.recommendation = 'equal';
      } else if (isEthanolBetter) {
        this.resultado = 'Abasteça com Etanol';
        this.recommendation = 'ethanol';
      } else {
        this.resultado = 'Abasteça com Gasolina';
        this.recommendation = 'gas';
      }
    } else {
        this.resultado = '';
        this.recommendation = '';
    }
  }

  @action handleForm = (keyOrObject: string | Record<string, any>, value?: any) => {
    if (typeof keyOrObject === 'string') {
        this[keyOrObject] = value;
    } else if (typeof keyOrObject === 'object') {
        Object.keys(keyOrObject).forEach(key => {
            this[key] = keyOrObject[key];
        });
    }
    this.calculate(); // Auto calculate
  }

}
const homeStore = new HomeStore();

export { homeStore };
