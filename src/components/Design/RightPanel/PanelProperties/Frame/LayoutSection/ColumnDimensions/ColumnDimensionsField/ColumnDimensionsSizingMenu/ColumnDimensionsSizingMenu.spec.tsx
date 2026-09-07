import { render, screen } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

// components
import ColumnDimensionsSizingMenu from './ColumnDimensionsSizingMenu';

// types
import { SizingMode } from 'types/design/enums';

const renderMenu = (overrides: Partial<Parameters<typeof ColumnDimensionsSizingMenu>[0]> = {}): ReturnType<typeof render> =>
  render(
    <PopoverPrimitive.Root open>
      <ColumnDimensionsSizingMenu axis="width" mode={SizingMode.fixed} onSelect={vi.fn()} value={77} {...overrides} />
    </PopoverPrimitive.Root>,
  );

describe('ColumnDimensionsSizingMenu snapshots', () => {
  it('should render the width sizing options', () => {
    // before
    const { asFragment } = renderMenu();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColumnDimensionsSizingMenu behaviors', () => {
  it('should show the current width value in the Fixed option label', () => {
    // before
    renderMenu({ value: 326.4 });

    // result
    expect(screen.getByText('Fixed width (326)')).toBeInTheDocument();
  });

  it('should show the current height value in the Fixed option label for the height axis', () => {
    // before
    renderMenu({ axis: 'height', value: 187 });

    // result
    expect(screen.getByText('Fixed height (187)')).toBeInTheDocument();
  });

  it('should render the width min/max placeholder labels', () => {
    // before
    renderMenu();

    // result
    expect(screen.getByText('Add min width…')).toBeInTheDocument();
    expect(screen.getByText('Add max width…')).toBeInTheDocument();
  });

  it('should render the height min/max placeholder labels for the height axis', () => {
    // before
    renderMenu({ axis: 'height' });

    // result
    expect(screen.getByText('Add min height…')).toBeInTheDocument();
    expect(screen.getByText('Add max height…')).toBeInTheDocument();
  });

  it('should render the apply-variable placeholder', () => {
    // before
    renderMenu();

    // result
    expect(screen.getByText('Apply variable…')).toBeInTheDocument();
  });

  it('should call onSelect with fixed when the Fixed option is clicked', () => {
    // mock
    const onSelect = vi.fn();

    // before
    renderMenu({ onSelect });

    // action
    screen.getByText('Fixed width (77)').click();

    // result
    expect(onSelect).toHaveBeenCalledWith(SizingMode.fixed);
  });

  it('should call onSelect with hug when the Hug contents option is clicked', () => {
    // mock
    const onSelect = vi.fn();

    // before
    renderMenu({ onSelect });

    // action
    screen.getByText('Hug contents').click();

    // result
    expect(onSelect).toHaveBeenCalledWith(SizingMode.hug);
  });

  it('should not call onSelect when the min/max/variable placeholders are clicked', () => {
    // mock
    const onSelect = vi.fn();

    // before
    renderMenu({ onSelect });

    // action
    screen.getByText('Add min width…').click();
    screen.getByText('Add max width…').click();
    screen.getByText('Apply variable…').click();

    // result
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should mark the Hug option as selected when the mode is hug', () => {
    // before
    renderMenu({ mode: SizingMode.hug });
    const hugRow = screen.getByText('Hug contents').closest('div')!.parentElement!;
    const fixedRow = screen.getByText('Fixed width (77)').closest('div')!.parentElement!;

    // result — PopoverItem renders a Check icon with opacity 1 when selected, 0 otherwise
    expect(hugRow.querySelector('span[style*="opacity: 1"]')).not.toBeNull();
    expect(fixedRow.querySelector('span[style*="opacity: 1"]')).toBeNull();
  });
});
