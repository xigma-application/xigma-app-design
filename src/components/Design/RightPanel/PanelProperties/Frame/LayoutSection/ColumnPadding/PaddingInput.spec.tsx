import { fireEvent, render, screen } from '@testing-library/react';

// components
import PaddingInput from './PaddingInput';
import { TooltipProvider } from 'shared';

describe('PaddingInput behaviors', () => {
  it('should commit the typed padding on blur and report hovering', () => {
    // mock
    const handlers = { onCommit: vi.fn(), onHoverEnd: vi.fn(), onHoverStart: vi.fn(), onScrub: vi.fn() };

    // before
    render(
      <TooltipProvider>
        <PaddingInput
          ariaLabel="Left padding"
          e2eValue="padding-left"
          iconName="PaddingL"
          scrubValue={4}
          tooltip="Left"
          value={4}
          {...handlers}
        />
      </TooltipProvider>,
    );

    // find
    const input = screen.getByLabelText('Left padding');

    // action
    fireEvent.mouseEnter(input.closest('div[class]')?.parentElement?.parentElement ?? input);
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.blur(input);

    // result
    expect(handlers.onCommit).toHaveBeenCalledWith('12');
  });

  it('should report the pointer entering and leaving the field', () => {
    // mock
    const handlers = { onCommit: vi.fn(), onHoverEnd: vi.fn(), onHoverStart: vi.fn(), onScrub: vi.fn() };

    // before
    const { container } = render(
      <TooltipProvider>
        <PaddingInput
          ariaLabel="Top padding"
          e2eValue="padding-top"
          iconName="PaddingT"
          scrubValue={0}
          tooltip="Top"
          value="Mixed"
          {...handlers}
        />
      </TooltipProvider>,
    );

    // action
    fireEvent.mouseEnter(container.firstChild as HTMLElement);
    fireEvent.mouseLeave(container.firstChild as HTMLElement);

    // result
    expect(handlers.onHoverStart).toHaveBeenCalled();
    expect(handlers.onHoverEnd).toHaveBeenCalled();
    expect(screen.getByLabelText('Top padding')).toHaveValue('Mixed');
  });
});
