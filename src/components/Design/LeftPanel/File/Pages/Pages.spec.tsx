import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';

// components
import Pages from './Pages';

// store
import { store } from 'store';

const renderPages = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <Pages />
    </Provider>,
  );

describe('Pages snapshots', () => {
  it('should render Pages', () => {
    // before
    const { asFragment } = renderPages();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Pages behaviors', () => {
  it('should render the active page name from the store', () => {
    // before
    renderPages();

    // result
    expect(screen.getByText('Page 1')).toBeInTheDocument();
  });

  it('should render the search and add-page buttons', () => {
    // before
    renderPages();

    // result
    expect(screen.getByRole('button', { name: 'Search pages' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add page' })).toBeInTheDocument();
  });
});
