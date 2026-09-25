import { fireEvent, render, screen } from '@testing-library/react';

// components
import CornerSmoothingPopoverHeader from './CornerSmoothingPopoverHeader';
import { TooltipProvider } from 'shared';

describe('CornerSmoothingPopoverHeader behaviors', () => {
  it('should show the title and close from its button', () => {
    // mock
    const onClose = vi.fn();

    // before
    render(
      <TooltipProvider>
        <CornerSmoothingPopoverHeader onClose={onClose} />
      </TooltipProvider>,
    );

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Corner smoothing')).toBeInTheDocument();
  });
});
