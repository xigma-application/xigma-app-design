import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Frame from './Frame';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderFrame = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <Frame />
      </TooltipProvider>
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
});
