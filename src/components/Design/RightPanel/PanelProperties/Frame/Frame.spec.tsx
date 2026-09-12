import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Frame from './Frame';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { store } from 'store';

const renderFrame = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <Frame />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('Frame snapshots', () => {
  it('should render the FrameHeader', () => {
    // before
    const { asFragment } = renderFrame();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Frame behaviors', () => {
  it('should render the Frame label', () => {
    // before
    renderFrame();

    // result
    expect(screen.getByText('Frame')).toBeInTheDocument();
  });

  it('should render the Position section', () => {
    // before
    renderFrame();

    // result
    expect(screen.getAllByText('Position')).toHaveLength(2);
  });

  it('should render the Layout section', () => {
    // before
    renderFrame();

    // result
    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.getByText('Flow')).toBeInTheDocument();
  });

  it('should render the Appearance section', () => {
    // before
    renderFrame();

    // result
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Opacity')).toBeInTheDocument();
    expect(screen.getByText('Corner radius')).toBeInTheDocument();
  });
});
