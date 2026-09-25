import { fireEvent, render, screen } from '@testing-library/react';

// components
import CornerRadiusInput from './CornerRadiusInput';
import { TooltipProvider } from 'shared';

describe('CornerRadiusInput behaviors', () => {
  it('should show the value and commit the typed radius on blur', () => {
    // mock
    const onCommit = vi.fn();

    // before
    render(
      <TooltipProvider>
        <CornerRadiusInput
          ariaLabel="Top left radius"
          e2eValue="top-left"
          iconName="Corners"
          onCommit={onCommit}
          onScrub={vi.fn()}
          scrubValue={4}
          tooltip="Top left"
          value={4}
        />
      </TooltipProvider>,
    );

    // find
    const input = screen.getByLabelText('Top left radius');

    // action
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.blur(input);

    // result
    expect(onCommit).toHaveBeenCalledWith('12');
  });

  it('should disable the field when disabled', () => {
    // before
    render(
      <TooltipProvider>
        <CornerRadiusInput
          ariaLabel="Corner radius"
          disabled
          e2eValue="corner-radius"
          iconName="Corners"
          onCommit={vi.fn()}
          onScrub={vi.fn()}
          scrubValue={0}
          tooltip="Corner radius"
          value={0}
        />
      </TooltipProvider>,
    );

    // result
    expect(screen.getByLabelText('Corner radius')).toBeDisabled();
  });
});
