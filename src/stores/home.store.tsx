import { action, observable } from 'mobx';

export default class HomeStore {

  @observable etanol = '';
  @observable gasolina = '';
  @observable resultado = '';
  @observable recommendation = ''; // 'gas', 'ethanol', 'equal', ''

  @action calculate = () => {
    const etanolValue = parseFloat(this.etanol.replace(',', '.'));
    const gasolinaValue = parseFloat(this.gasolina.replace(',', '.'));

    if (!isNaN(etanolValue) && !isNaN(gasolinaValue) && gasolinaValue > 0) {
      const value = etanolValue / gasolinaValue;

      if (value > 0.70) {
        this.resultado = 'Abasteça com Gasolina';
        this.recommendation = 'gas';
      } else if (value < 0.70) {
        this.resultado = 'Abasteça com Etanol';
        this.recommendation = 'ethanol';
      } else {
        this.resultado = 'Tanto faz';
        this.recommendation = 'equal';
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
