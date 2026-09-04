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
  it('should render the alignment and position rows', () => {
    // before
    const { asFragment } = renderPositionSection();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PositionSection behaviors', () => {
  it('should render the alignment row label', () => {
    // before
    renderPositionSection();

    // result
    expect(screen.getByText('Alignment')).toBeInTheDocument();
  });

  it('should render the section label and the position row label', () => {
    // before
    renderPositionSection();

    // result
    expect(screen.getAllByText('Position')).toHaveLength(2);
  });
});
