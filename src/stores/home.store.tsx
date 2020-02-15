import { action, observable } from 'mobx';

export default class HomeStore {
    @observable numbers = 0;

    @action reset = () => {
        this.numbers = 0;
    }

    @action increment = () => {
        this.numbers += 1;
    }

    @action decrement = () => {
        this.numbers -= 1;
    }

}
const homeStore = new HomeStore();

export { homeStore };
