import { render, screen } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

// components
import ColumnDimensionsSizingMenu from './ColumnDimensionsSizingMenu';

// types
import { SizingMode } from 'types/design/enums';

const renderMenu = (overrides: Partial<Parameters<typeof ColumnDimensionsSizingMenu>[0]> = {}): ReturnType<typeof render> =>
  render(
    <PopoverPrimitive.Root open>
      <ColumnDimensionsSizingMenu
        axis="width"
        canFill
        canHug
        hasMax={false}
        hasMin={false}
        mode={SizingMode.fixed}
        onSelect={vi.fn()}
        onToggleMax={vi.fn()}
        onToggleMin={vi.fn()}
        value={77}
        {...overrides}
      />
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

  it('should render the Fill container option for the width axis and call onSelect with fill when clicked', () => {
    // mock
    const onSelect = vi.fn();

    // before
    renderMenu({ onSelect });

    // action
    screen.getByText('Fill container').click();

    // result
    expect(onSelect).toHaveBeenCalledWith(SizingMode.fill);
  });

  it('should mark the Fill option as selected when the mode is fill', () => {
    // before
    renderMenu({ mode: SizingMode.fill });
    const fillRow = screen.getByText('Fill container').closest('div')!.parentElement!;

    // result
    expect(fillRow.querySelector('span[style*="opacity: 1"]')).not.toBeNull();
  });

  it('should not render the Hug option when canHug is false', () => {
    // before
    renderMenu({ canHug: false });

    // result
    expect(screen.queryByText('Hug contents')).toBeNull();
  });

  it('should not render the Fill option when canFill is false', () => {
    // before
    renderMenu({ canFill: false });

    // result
    expect(screen.queryByText('Fill container')).toBeNull();
  });

  it('should not render the min/max items when canHug is false', () => {
    // before
    renderMenu({ canHug: false });

    // result
    expect(screen.queryByText('Add min width…')).toBeNull();
    expect(screen.queryByText('Add max width…')).toBeNull();
  });

  it('should call onToggleMin when the Add min width item is clicked', () => {
    // mock
    const onToggleMin = vi.fn();

    // before
    renderMenu({ onToggleMin });

    // action
    screen.getByText('Add min width…').click();

    // result
    expect(onToggleMin).toHaveBeenCalledTimes(1);
  });

  it('should call onToggleMax when the Add max width item is clicked', () => {
    // mock
    const onToggleMax = vi.fn();

    // before
    renderMenu({ onToggleMax });

    // action
    screen.getByText('Add max width…').click();

    // result
    expect(onToggleMax).toHaveBeenCalledTimes(1);
  });

  it('should switch the min/max labels to "Remove…" once hasMin/hasMax are true', () => {
    // before
    renderMenu({ hasMax: true, hasMin: true });

    // result
    expect(screen.getByText('Remove min width…')).toBeInTheDocument();
    expect(screen.getByText('Remove max width…')).toBeInTheDocument();
  });

  it('should switch the min/max labels to "Remove…" for the height axis too', () => {
    // before
    renderMenu({ axis: 'height', hasMax: true, hasMin: true });

    // result
    expect(screen.getByText('Remove min height…')).toBeInTheDocument();
    expect(screen.getByText('Remove max height…')).toBeInTheDocument();
  });
});
