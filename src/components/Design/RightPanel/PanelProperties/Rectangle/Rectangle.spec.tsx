import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Rectangle from './Rectangle';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { store } from 'store';

const renderRectangle = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <Rectangle />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('Rectangle snapshots', () => {
  it('should render the header, position and dimensions', () => {
    // before
    const { asFragment } = renderRectangle();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Rectangle behaviors', () => {
  it('should render the Rectangle label', () => {
    // before
    renderRectangle();

    // result
    expect(screen.getByText('Rectangle')).toBeInTheDocument();
  });

  it('should render the Position section', () => {
    // before
    renderRectangle();

    // result
    expect(screen.getAllByText('Position')).toHaveLength(2);
  });

  it('should render the Layout section with the Dimensions row only', () => {
    // before
    renderRectangle();

    // result
    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.queryByText('Flow')).not.toBeInTheDocument();
  });
});
