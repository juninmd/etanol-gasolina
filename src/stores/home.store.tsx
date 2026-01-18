import { action, observable } from 'mobx';

export default class HomeStore {

  @observable etanol = '';
  @observable gasolina = '';
  @observable etanolConsumption = '';
  @observable gasolinaConsumption = '';
  @observable resultado = '';
  @observable recommendation = ''; // 'gas', 'ethanol', 'equal', ''

  @action calculate = () => {
    const etanolValue = parseFloat(this.etanol.replace(',', '.'));
    const gasolinaValue = parseFloat(this.gasolina.replace(',', '.'));
    const etanolCons = parseFloat(this.etanolConsumption.replace(',', '.'));
    const gasolinaCons = parseFloat(this.gasolinaConsumption.replace(',', '.'));

    if (!isNaN(etanolValue) && !isNaN(gasolinaValue) && gasolinaValue > 0) {
      let isEthanolBetter = false;
      let isEqual = false;

      if (!isNaN(etanolCons) && !isNaN(gasolinaCons) && etanolCons > 0 && gasolinaCons > 0) {
        // Calculate cost per km
        const costEthanol = etanolValue / etanolCons;
        const costGas = gasolinaValue / gasolinaCons;

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

  @action handleForm = (input) => {
    const key = Object.keys(input)[0];
    const value = input[key];
    this[key] = value;
    this.calculate(); // Auto calculate
  }

}
const homeStore = new HomeStore();

export { homeStore };
