import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Star from './Star';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { store } from 'store';

const renderStar = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <Star />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('Star snapshots', () => {
  it('should render the header, position, layout, appearance with the count and ratio and export', () => {
    // before
    const { asFragment } = renderStar();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Star behaviors', () => {
  it('should render the Star label and the Layout section', () => {
    // before
    renderStar();

    // result
    expect(screen.getByText('Star')).toBeInTheDocument();
    expect(screen.getByText('Layout')).toBeInTheDocument();
  });

  it('should show the corner radius, Count and Ratio rows in Appearance, then Fill, Stroke and Effects', () => {
    // before
    renderStar();

    // result
    expect(screen.getByText('Corner radius')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.getByText('Ratio')).toBeInTheDocument();
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getByText('Stroke')).toBeInTheDocument();
    expect(screen.getByText('Effects')).toBeInTheDocument();
  });
});
