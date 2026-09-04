import { render, screen } from '@testing-library/react';

// components
import FrameHeader from './FrameHeader';
import { TooltipProvider } from 'shared';

const renderFrameHeader = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <FrameHeader />
    </TooltipProvider>,
  );

describe('FrameHeader snapshots', () => {
  it('should render the Frame label with its trailing buttons', () => {
    // before
    const { asFragment } = renderFrameHeader();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('FrameHeader behaviors', () => {
  it('should render the Frame label', () => {
    // before
    renderFrameHeader();

    // result
    expect(screen.getByText('Frame')).toBeInTheDocument();
  });

  it('should render the html tag, component, and mask buttons', () => {
    // before
    renderFrameHeader();

    // result
    expect(screen.getByLabelText('Toggle ready for dev status')).toBeInTheDocument();
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
    expect(screen.getByLabelText('Use as mask')).toBeInTheDocument();
  });
});
