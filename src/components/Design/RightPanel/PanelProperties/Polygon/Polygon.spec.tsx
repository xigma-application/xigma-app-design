import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Polygon from './Polygon';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { store } from 'store';

const renderPolygon = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <Polygon />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('Polygon snapshots', () => {
  it('should render the header, position, layout, appearance with the count and export', () => {
    // before
    const { asFragment } = renderPolygon();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Polygon behaviors', () => {
  it('should render the Polygon label and the Layout section', () => {
    // before
    renderPolygon();

    // result
    expect(screen.getByText('Polygon')).toBeInTheDocument();
    expect(screen.getByText('Layout')).toBeInTheDocument();
  });

  it('should show the corner radius and Count rows in Appearance, then Fill, Stroke and Effects', () => {
    // before
    renderPolygon();

    // result
    expect(screen.getByText('Corner radius')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getByText('Stroke')).toBeInTheDocument();
    expect(screen.getByText('Effects')).toBeInTheDocument();
  });
});
