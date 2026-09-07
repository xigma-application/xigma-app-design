import { render, screen } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

// components
import ColumnGapModeMenu from './ColumnGapModeMenu';

// types
import { GapMode } from 'types/design/enums';

const renderMenu = (overrides: Partial<Parameters<typeof ColumnGapModeMenu>[0]> = {}): ReturnType<typeof render> =>
  render(
    <PopoverPrimitive.Root open>
      <ColumnGapModeMenu canAuto mode={GapMode.fixed} onSelectAuto={vi.fn()} onSelectFixed={vi.fn()} value={12} {...overrides} />
    </PopoverPrimitive.Root>,
  );

describe('ColumnGapModeMenu snapshots', () => {
  it('should render the fixed and auto options', () => {
    // before
    const { asFragment } = renderMenu();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColumnGapModeMenu behaviors', () => {
  it('should show the rounded current value as the Fixed option label', () => {
    // before
    renderMenu({ value: 12.6 });

    // result
    expect(screen.getByText('13')).toBeInTheDocument();
  });

  it('should render the apply-variable placeholder', () => {
    // before
    renderMenu();

    // result
    expect(screen.getByText('Apply variable…')).toBeInTheDocument();
  });

  it('should call onSelectFixed when the value option is clicked', () => {
    // mock
    const onSelectFixed = vi.fn();

    // before
    renderMenu({ onSelectFixed, value: 8 });

    // action
    screen.getByText('8').click();

    // result
    expect(onSelectFixed).toHaveBeenCalledTimes(1);
  });

  it('should call onSelectAuto when the Auto option is clicked', () => {
    // mock
    const onSelectAuto = vi.fn();

    // before
    renderMenu({ onSelectAuto });

    // action
    screen.getByText('Auto').click();

    // result
    expect(onSelectAuto).toHaveBeenCalledTimes(1);
  });

  it('should mark the Auto option as selected when the mode is auto', () => {
    // before
    renderMenu({ mode: GapMode.auto, value: 8 });
    const autoRow = screen.getByText('Auto').closest('div')!.parentElement!;
    const fixedRow = screen.getByText('8').closest('div')!.parentElement!;

    // result — PopoverItem renders a Check icon with opacity 1 when selected, 0 otherwise
    expect(autoRow.querySelector('span[style*="opacity: 1"]')).not.toBeNull();
    expect(fixedRow.querySelector('span[style*="opacity: 1"]')).toBeNull();
  });

  it('should not render the Auto option when canAuto is false', () => {
    // before
    renderMenu({ canAuto: false });

    // result
    expect(screen.queryByText('Auto')).toBeNull();
  });

  it('should not call onSelectFixed/onSelectAuto when the variable item is clicked', () => {
    // mock
    const onSelectAuto = vi.fn();
    const onSelectFixed = vi.fn();

    // before
    renderMenu({ onSelectAuto, onSelectFixed });

    // action
    screen.getByText('Apply variable…').click();

    // result
    expect(onSelectAuto).not.toHaveBeenCalled();
    expect(onSelectFixed).not.toHaveBeenCalled();
  });
});
