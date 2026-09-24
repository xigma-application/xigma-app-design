import { fireEvent, render, screen } from '@testing-library/react';

// components
import DistributeMenu from './DistributeMenu';
import { TooltipProvider } from 'shared';

const renderDistributeMenu = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <DistributeMenu />
    </TooltipProvider>,
  );

describe('DistributeMenu snapshots', () => {
  it('should render the closed distribute trigger', () => {
    // before
    const { asFragment } = renderDistributeMenu();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('DistributeMenu behaviors', () => {
  it('should list tidy up and both distribute spacing items with their shortcuts when opened', () => {
    // before
    renderDistributeMenu();

    // action
    fireEvent.click(screen.getByLabelText('More actions'));

    // result
    expect(screen.getByText('Tidy up')).toBeInTheDocument();
    expect(screen.getByText('Distribute vertical spacing')).toBeInTheDocument();
    expect(screen.getByText('Distribute horizontal spacing')).toBeInTheDocument();
  });

  it('should render Tidy up disabled and both distribute spacing items enabled', () => {
    // before
    renderDistributeMenu();

    // action
    fireEvent.click(screen.getByLabelText('More actions'));

    // result
    expect(screen.getByText('Tidy up').closest('[class*="PopoverItem--disabled"]')).not.toBeNull();
    expect(screen.getByText('Distribute vertical spacing').closest('[class*="PopoverItem--disabled"]')).toBeNull();
    expect(screen.getByText('Distribute horizontal spacing').closest('[class*="PopoverItem--disabled"]')).toBeNull();
  });
});
