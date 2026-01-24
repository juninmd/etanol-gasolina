import { action, observable } from 'mobx';

export default class ThemeStore {
    @observable theme: 'light' | 'dark' = 'light';

    @action toggleTheme = () => {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
    }
}

const themeStore = new ThemeStore();
export { themeStore };
