/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

// Mock the Routes component to avoid navigating complexity in unit test
jest.mock('../src/routes', () => 'Routes');

it('renders correctly', () => {
  renderer.create(<App />);
});
