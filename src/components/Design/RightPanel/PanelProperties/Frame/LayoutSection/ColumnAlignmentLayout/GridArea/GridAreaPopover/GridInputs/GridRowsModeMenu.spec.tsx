import { fireEvent, render, screen } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

// components
import GridRowsModeMenu from './GridRowsModeMenu';

const renderMenu = (props: Partial<Parameters<typeof GridRowsModeMenu>[0]> = {}): ReturnType<typeof render> =>
  render(
    <PopoverPrimitive.Root open>
      <GridRowsModeMenu isAuto={false} onSetAuto={vi.fn()} onSetFixed={vi.fn()} value="3" {...props} />
    </PopoverPrimitive.Root>,
  );

describe('GridRowsModeMenu', () => {
  it('should list the fixed value and Auto', () => {
    renderMenu({ isAuto: true, value: '5' });

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Auto')).toBeInTheDocument();
  });

  it('should call onSetFixed when the fixed value is chosen', () => {
    const onSetFixed = vi.fn();

    renderMenu({ onSetFixed, value: '3' });
    fireEvent.click(screen.getByText('3'));

    expect(onSetFixed).toHaveBeenCalledTimes(1);
  });

  it('should call onSetAuto when Auto is chosen', () => {
    const onSetAuto = vi.fn();

    renderMenu({ onSetAuto });
    fireEvent.click(screen.getByText('Auto'));

    expect(onSetAuto).toHaveBeenCalledTimes(1);
  });
});
