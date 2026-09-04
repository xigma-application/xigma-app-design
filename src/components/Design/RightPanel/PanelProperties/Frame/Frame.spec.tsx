import { render, screen } from '@testing-library/react';

// components
import Frame from './Frame';
import { TooltipProvider } from 'shared';

const renderFrame = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <Frame />
    </TooltipProvider>,
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
});
