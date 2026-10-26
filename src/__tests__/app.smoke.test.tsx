import React from 'react';
import renderer, {act} from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

// Os ícones Eva desenham com react-native-svg, que não roda no Jest.
jest.mock('react-native-svg', () => {
  const React = require('react');
  const make = (name: string) => (props: any) =>
    React.createElement(name, props, props.children);
  return new Proxy(
    {__esModule: true, default: make('Svg')} as Record<string, unknown>,
    {get: (target, key: string) => target[key] ?? make(key)},
  );
});

describe('App (smoke)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    act(() => jest.runOnlyPendingTimers());
    jest.useRealTimers();
  });

  it('monta a árvore inicial sem lançar erro', async () => {
    let tree: renderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = renderer.create(<App />);
    });
    expect(tree?.toJSON()).not.toBeNull();
    act(() => tree?.unmount());
  });
});
