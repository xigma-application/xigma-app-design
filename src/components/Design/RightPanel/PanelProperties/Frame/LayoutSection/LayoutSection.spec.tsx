import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import LayoutSection from './LayoutSection';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderLayoutSection = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <LayoutSection />
      </TooltipProvider>
    </Provider>,
  );

describe('LayoutSection snapshots', () => {
  it('should render the flow row', () => {
    // before
    const { asFragment } = renderLayoutSection();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('LayoutSection behaviors', () => {
  it('should render the section label', () => {
    // before
    renderLayoutSection();

    // result
    expect(screen.getByText('Layout')).toBeInTheDocument();
  });

  it('should render the flow row label', () => {
    // before
    renderLayoutSection();

    // result
    expect(screen.getByText('Flow')).toBeInTheDocument();
  });
});
