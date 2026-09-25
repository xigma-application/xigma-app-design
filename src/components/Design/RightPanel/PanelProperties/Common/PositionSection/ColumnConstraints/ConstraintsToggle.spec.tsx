import { fireEvent, render, screen } from '@testing-library/react';

// components
import ConstraintsToggle from './ConstraintsToggle';
import { TooltipProvider } from 'shared';

// types
import { AlignmentHorizontal } from 'types/design/enums';

describe('ConstraintsToggle behaviors', () => {
  it('should show the constraints preview and toggle on click', () => {
    // mock
    const onToggle = vi.fn();

    // before
    render(
      <TooltipProvider>
        <ConstraintsToggle active alignment={{ horizontal: AlignmentHorizontal.left }} onToggle={onToggle} />
      </TooltipProvider>,
    );

    // action
    fireEvent.click(screen.getByLabelText('Constraints'));

    // result
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
