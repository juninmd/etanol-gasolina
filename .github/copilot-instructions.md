# AI Copilot Instructions for Etanol-Gasolina

## Project Overview
**Etanol-Gasolina** is a cross-platform React Native + Web application that helps Brazilian users compare ethanol vs. gasoline prices and determine which fuel is more economical. Core logic: if ethanol price ≤ 70% of gasoline price, ethanol is better (standard Brazilian benchmark).

**Tech Stack:**
- React Native 0.61 + React 16.9 for mobile/cross-platform
- React Web (via react-app-rewired) for web version
- MobX 5 for state management (observable stores)
- React Navigation 5 for routing
- UI Kitten 4 (Eva Design) for components
- TypeScript 3.7 with experimental decorators
- Jest for testing (pnpm workspace)

## Architecture Essentials

### State Management: MobX Stores Pattern
All state lives in **4 observable stores** [src/stores/](src/stores/):
- **homeStore** – Calculator logic (ethanol/gas prices → recommendation)
- **stationsStore** – Station data, market analysis, comments, badges, savings tracking
- **garageStore** – Vehicle profiles (tank, consumption rates), fill logs
- **themeStore** – Light/dark theme toggle

**Key Pattern:** Stores use `@observable`, `@action`, `@computed` decorators. Components inject stores via `@inject('storeName')` and observe with `@observer`.

**Store Usage Example:**
```tsx
@inject('homeStore')
@observer
export default class Home extends Component<Props> {
  render() {
    const { homeStore } = this.props;
    return <Text>{homeStore.resultado}</Text>;
  }
}
```

Stores call each other (e.g., homeStore calls `garageStore.selectedVehicle` for consumption data). No Redux; MobX reactions handle side effects.

### Cross-Platform Build System
- **Mobile:** `npm run android|ios` → React Native Metro bundler
- **Web:** `npm run web` → react-app-rewired + custom Webpack overrides
- **Build:** `npm run build` → Creates static web build

**Web-specific handling:** `.web.tsx` files override React Native imports (e.g., `MapWrapper.web.tsx` for web). Webpack config [config-overrides.js](config-overrides.js) prioritizes `.web.*` extensions and aliases `react-native` to `react-native-patch.js`.

### Component Structure
- **Containers** [src/containers/](src/containers/) – Screen/page components that inject stores and orchestrate logic
- **Components** [src/components/](src/components/) – Reusable UI components (usually `@observer` for reactive rendering)
- **Routes** [src/routes/](src/routes/) – React Navigation setup (bottom tabs: Calculator, Stations, Favorites, Garage)

### Navigation Model
Bottom tab navigator with stack-based modal screens (StationDetails, AddVehicle, AddFill, MarketInsights). Use `navigation.navigate('ScreenName')` to push modals.

## Developer Workflows

### Running Tests
```bash
npm test                    # Run Jest suite
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report → coverage/lcov-report/
```

**Test locations:** [src/stores/__tests__/](src/stores/__tests__/) – test store observable behavior, `@computed` derivations, and `@action` side effects.

### Local Development
```bash
npm start                   # React Native Metro (shared across platforms)
npm run web                 # Dev server on http://localhost:3000
npm run build              # Production web build
```

### Adding Features
1. **New screen?** Create container in [src/containers/](src/containers/), add route to [src/routes/](src/routes/)
2. **New state?** Add `@observable @action` to relevant store; update tests in [src/stores/__tests__/](src/stores/__tests__/)
3. **New component?** Place in [src/components/](src/components/), use `@observer` if rendering store data
4. **Web-only?** Create `.web.tsx` variant (e.g., `MapWrapper.tsx` + `MapWrapper.web.tsx`)

## Critical Patterns & Conventions

### HomeStore Auto-Calculate Pattern
User fills input → `handleForm()` → `calculate()` auto-triggered. Calculation respects garage vehicle consumption if manual inputs are empty. Logic:
```
if (garageStore.selectedVehicle exists AND manual consumption empty):
  use vehicle.avgEthanolConsumption, vehicle.avgGasConsumption
else:
  use manual inputs or fallback to 70% rule
```

### Reactive Dependencies (MobX reaction)
Example in [src/containers/home/](src/containers/home/): promo detection watches `favorites + station promos` and re-checks on change.
```tsx
this.promoReaction = reaction(
  () => favorites.length,  // track expression
  () => this.checkPromos() // side effect
);
```
**Always clean up:** `componentWillUnmount() { this.promoReaction?.() }`

### StationsStore Market Analysis
Computes `marketAnalysis` (@computed): `{ avgGas, avgEthanol, ratio, bestFuel, potentialSavingsPct }`. Used by UI to show savings % and fuel recommendation badges.

### Garage Store: Vehicle + Fill Tracking
- Vehicles store `avgEthanolConsumption`, `avgGasConsumption` (km/l)
- Fill logs auto-calculate `totalCost = liters * pricePerLiter`
- `logsForSelectedVehicle` sorts fills by date DESC
- Stats computed: `totalSpent`, `fuelStats` (total liters, avg prices per fuel type)

## Testing Patterns
- Tests live in `__tests__/` alongside stores
- Mock time with Jest (`jest.useFakeTimers()`)
- Test observables: mutate state → verify computed derivations
- Example: [src/stores/__tests__/home.store.test.ts](src/stores/__tests__/home.store.test.ts)

## Build & Deployment Quirks
- **pnpm workspace:** Jest config handles nested node_modules symlinks via `transformIgnorePatterns`
- **Babel decorators:** `@babel/plugin-proposal-decorators` required (legacy); `experimentalDecorators: true` in tsconfig
- **Web alias:** `react-native` → [src/react-native-patch.js](src/react-native-patch.js) shims React Native Web API
- **Coverage reports:** Generated in [coverage/lcov-report/](coverage/lcov-report/)

## ⚠️ Observações Importantes

### Funcionalidades Desabilitadas (requerem backend)

Para manter a estabilidade da versão 1.0.0 de produção, as seguintes features estão comentadas:

- ✖️ Atualização de preços em tempo real (`startRealTimeUpdates()`)
- ✖️ Geofencing/check-in automático (`startGeofenceSimulation()`)

Essas features podem ser habilitadas quando um backend for implementado. Veja [src/stores/stations.store.ts](src/stores/stations.store.ts) linha ~152:

```typescript
constructor() {
    // Desabilitado para versão de produção - requer backend
    // this.startRealTimeUpdates();
    // this.startGeofenceSimulation();
}
```

### Dados Mock

Atualmente o app usa dados mock (hardcoded) para demonstração. Para produção real:
1. Implementar backend/API
2. Integrar com APIs de postos (ex: ANP, Preço da Hora)
3. Implementar autenticação de usuários
4. Persistir dados localmente (AsyncStorage/Realm)

### Versão de Produção

- **Versão atual:** 1.0.0
- **Target SDK:** 31 (Android 12)
- **Min SDK:** 21 (Android 5.0+)
- **Build Tools:** 30.0.3

### Publicação

Consulte os guias de publicação:
- [PLAY_STORE_CHECKLIST.md](PLAY_STORE_CHECKLIST.md) - Passo a passo completo
- [RELEASE_NOTES.md](RELEASE_NOTES.md) - Notas da versão
- [PRIVACY_POLICY.md](PRIVACY_POLICY.md) - Política de privacidade

## File Navigation Tips
1. **Forget @observer?** Component won't re-render when store observables change
2. **Async in stores?** Use `runInAction()` to wrap state mutations inside Promises/callbacks
3. **Navigation props missing?** Inject navigation: `@inject('navigation')` or use React Navigation hooks
4. **Web build fails?** Check `.web.tsx` files for Android/iOS-only APIs; webpack needs web-compatible versions
5. **Store mutations not triggering UI?** Ensure `@action` wraps all mutations; direct assignment to observable fields requires `@action`

## File Navigation Tips
- Store logic: [src/stores/](src/stores/)
- UI logic: [src/containers/](src/containers/) + [src/components/](src/components/)
- Routing: [src/routes/index.tsx](src/routes/index.tsx)
- Tests: [src/stores/__tests__/](src/stores/__tests__/)
- Web config: [config-overrides.js](config-overrides.js)
- Type definitions: [react-native.d.ts](src/react-native.d.ts), [typings/](typings/)
