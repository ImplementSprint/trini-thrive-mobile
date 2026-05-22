import { Children, isValidElement, ReactElement } from 'react';

import App from '../../src/bootstrap/App';
import { HomeScreen } from '../../src/features/home/screens/HomeScreen';

describe('App', () => {
  it('renders a status bar and home screen', () => {
    const element = App() as ReactElement<{ children?: React.ReactNode }>;

    expect(isValidElement(element)).toBe(true);

    const children = Children.toArray(element.props.children).filter(isValidElement) as ReactElement<any>[];
    expect(children).toHaveLength(2);

    const home = children[1];
    expect(home).toBeDefined();
    if (home) {
      expect(home.type).toBe(HomeScreen);
    }
  });
});
