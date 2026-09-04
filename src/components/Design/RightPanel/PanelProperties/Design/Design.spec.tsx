import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Design from './Design';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderDesign = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <Design />
      </TooltipProvider>
    </Provider>,
  );

describe('Design snapshots', () => {
  it('should render the Page section with its background column', () => {
    // before
    const { asFragment } = renderDesign();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Design behaviors', () => {
  it('should label the section "Page"', () => {
    // before
    renderDesign();

    // result
    expect(screen.getByText('Page')).toBeInTheDocument();
  });
});
