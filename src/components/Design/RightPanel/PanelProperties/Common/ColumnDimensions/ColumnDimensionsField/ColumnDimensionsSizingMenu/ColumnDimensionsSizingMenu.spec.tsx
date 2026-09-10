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
        maxShown={false}
        minShown={false}
        mode={SizingMode.fixed}
        onRemoveBounds={vi.fn()}
        onRevealMax={vi.fn()}
        onRevealMin={vi.fn()}
        onSelect={vi.fn()}
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

  it('should render the min/max placeholder labels when no bound value is set', () => {
    // before
    renderMenu();

    // result
    expect(screen.getByText('Add min width…')).toBeInTheDocument();
    expect(screen.getByText('Add max width…')).toBeInTheDocument();
  });

  it('should render the current bound value in the min/max labels once set', () => {
    // before
    renderMenu({ maxValue: 500, minValue: 123.6 });

    // result
    expect(screen.getByText('Min width: 124')).toBeInTheDocument();
    expect(screen.getByText('Max width: 500')).toBeInTheDocument();
  });

  it('should render the height bound value labels for the height axis', () => {
    // before
    renderMenu({ axis: 'height', maxValue: 200, minValue: 80 });

    // result
    expect(screen.getByText('Min height: 80')).toBeInTheDocument();
    expect(screen.getByText('Max height: 200')).toBeInTheDocument();
  });

  it('should render the apply-variable placeholder', () => {
    // before
    renderMenu();

    // result
    expect(screen.getByText('Apply variable…')).toBeInTheDocument();
  });

  it('should call onRevealMin when the min item is clicked', () => {
    // mock
    const onRevealMin = vi.fn();

    // before
    renderMenu({ onRevealMin });

    // action
    screen.getByText('Add min width…').click();

    // result
    expect(onRevealMin).toHaveBeenCalledTimes(1);
  });

  it('should call onRevealMax when the max item is clicked', () => {
    // mock
    const onRevealMax = vi.fn();

    // before
    renderMenu({ onRevealMax });

    // action
    screen.getByText('Add max width…').click();

    // result
    expect(onRevealMax).toHaveBeenCalledTimes(1);
  });

  it('should not render the Remove item when neither bound is shown', () => {
    // before
    renderMenu();

    // result
    expect(screen.queryByText(/Remove/)).toBeNull();
  });

  it('should render the Remove min width item when only the min bound is shown', () => {
    // before
    renderMenu({ minShown: true });

    // result
    expect(screen.getByText('Remove min width')).toBeInTheDocument();
  });

  it('should render the Remove max width item when only the max bound is shown', () => {
    // before
    renderMenu({ maxShown: true });

    // result
    expect(screen.getByText('Remove max width')).toBeInTheDocument();
  });

  it('should render the combined Remove item when both bounds are shown', () => {
    // before
    renderMenu({ maxShown: true, minShown: true });

    // result
    expect(screen.getByText('Remove min and max width')).toBeInTheDocument();
  });

  it('should render the combined Remove item for the height axis', () => {
    // before
    renderMenu({ axis: 'height', maxShown: true, minShown: true });

    // result
    expect(screen.getByText('Remove min and max height')).toBeInTheDocument();
  });

  it('should call onRemoveBounds when the Remove item is clicked', () => {
    // mock
    const onRemoveBounds = vi.fn();

    // before
    renderMenu({ minShown: true, onRemoveBounds });

    // action
    screen.getByText('Remove min width').click();

    // result
    expect(onRemoveBounds).toHaveBeenCalledTimes(1);
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

  it('should not call onSelect when the min/max/variable items are clicked', () => {
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

  it('should not render the Hug option when canHug is false', () => {
    // before
    renderMenu({ canHug: false });

    // result
    expect(screen.queryByText('Hug contents')).toBeNull();
  });

  it('should not render the min/max items when canHug is false', () => {
    // before
    renderMenu({ canHug: false, minShown: true });

    // result
    expect(screen.queryByText('Add min width…')).toBeNull();
    expect(screen.queryByText('Add max width…')).toBeNull();
    expect(screen.queryByText('Remove min width')).toBeNull();
  });
});
