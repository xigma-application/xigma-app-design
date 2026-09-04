import { fireEvent, render, screen, within } from '@testing-library/react';

// components
import FrameTool from './FrameTool';
import { TooltipProvider } from 'shared';

const renderFrameTool = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <FrameTool />
    </TooltipProvider>,
  );

describe('FrameTool snapshots', () => {
  it('should render the Frame section with a preset accordion', () => {
    // before
    const { asFragment } = renderFrameTool();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('FrameTool behaviors', () => {
  it('should render the Frame section label', () => {
    // before
    renderFrameTool();

    // result
    expect(screen.getByText('Frame')).toBeInTheDocument();
  });

  it('should render every preset group label', () => {
    // before
    renderFrameTool();

    // result
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Tablet')).toBeInTheDocument();
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('Presentation')).toBeInTheDocument();
    expect(screen.getByText('Watch')).toBeInTheDocument();
    expect(screen.getByText('Paper')).toBeInTheDocument();
    expect(screen.getByText('Social media')).toBeInTheDocument();
    expect(screen.getByText('Figma Community')).toBeInTheDocument();
    expect(screen.getByText('Archive')).toBeInTheDocument();
  });

  it('should keep every group collapsed by default', () => {
    // before
    renderFrameTool();
    const phoneGroup = screen.getByText('Phone').closest('button') as HTMLElement;
    const tabletGroup = screen.getByText('Tablet').closest('button') as HTMLElement;

    // result
    expect(phoneGroup).toHaveAttribute('aria-expanded', 'false');
    expect(tabletGroup).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('iPhone 17')).not.toBeInTheDocument();
    expect(screen.queryByText('iPad mini 8.3')).not.toBeInTheDocument();
  });

  it('should render a preset with its dimensions once its group is expanded', () => {
    // before
    renderFrameTool();

    // action
    fireEvent.click(screen.getByText('Phone'));
    const row = screen.getByText('iPhone 17').closest('button') as HTMLElement;

    // result
    expect(within(row).getByText('402×874')).toBeInTheDocument();
  });
});
