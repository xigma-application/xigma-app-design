import { fireEvent, render, screen } from '@testing-library/react';

// components
import GridSettingsHeader from './GridSettingsHeader';
import { TooltipProvider } from 'shared';

describe('GridSettingsHeader', () => {
  it('should render the panel title', () => {
    render(
      <TooltipProvider>
        <GridSettingsHeader onClose={vi.fn()} />
      </TooltipProvider>,
    );

    expect(screen.getByText('Grid')).toBeInTheDocument();
  });

  it('should call onClose when the close button is clicked', () => {
    const onClose = vi.fn();

    render(
      <TooltipProvider>
        <GridSettingsHeader onClose={onClose} />
      </TooltipProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close grid settings' }));

    expect(onClose).toHaveBeenCalled();
  });
});
