import { render } from '@testing-library/react';

// components
import App from './App';

describe('App snapshots', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should render App', () => {
    // before
    const { asFragment } = render(<App />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should sync the theme onto the document root on mount, regardless of which page is rendered', () => {
    // before
    render(<App />);

    // result
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
