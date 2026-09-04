import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PositionSection from './PositionSection';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderPositionSection = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <PositionSection />
      </TooltipProvider>
    </Provider>,
  );

describe('PositionSection snapshots', () => {
  it('should render the Position section with the alignment row', () => {
    // before
    const { asFragment } = renderPositionSection();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PositionSection behaviors', () => {
  it('should render the section label', () => {
    // before
    renderPositionSection();

    // result
    expect(screen.getByText('Position')).toBeInTheDocument();
  });

  it('should render the alignment row label', () => {
    // before
    renderPositionSection();

    // result
    expect(screen.getByText('Alignment')).toBeInTheDocument();
  });
});
