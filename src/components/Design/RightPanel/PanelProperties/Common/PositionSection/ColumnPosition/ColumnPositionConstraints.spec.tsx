import { fireEvent, render, screen } from '@testing-library/react';

// components
import { ColumnPositionConstraints } from './ColumnPositionConstraints';
import { TooltipProvider } from 'shared';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

describe('ColumnPositionConstraints behaviors', () => {
  it('should return nothing when constraints are hidden', () => {
    // result
    expect(ColumnPositionConstraints(true, false, undefined, undefined, vi.fn())).toBeUndefined();
  });

  it('should return the constraints toggle otherwise', () => {
    // mock
    const onToggle = vi.fn();

    // before
    render(
      <TooltipProvider>
        {ColumnPositionConstraints(false, true, AlignmentHorizontal.left, AlignmentVertical.top, onToggle)}
      </TooltipProvider>,
    );

    // action
    fireEvent.click(screen.getByLabelText('Constraints'));

    // result
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
