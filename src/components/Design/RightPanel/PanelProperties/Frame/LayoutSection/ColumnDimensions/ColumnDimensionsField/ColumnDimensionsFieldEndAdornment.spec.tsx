import { fireEvent, render, screen } from '@testing-library/react';

// components
import ColumnDimensionsFieldEndAdornment from './ColumnDimensionsFieldEndAdornment';

// types
import { SizingMode } from 'types/design/enums';

const renderEndAdornment = (overrides: Partial<Parameters<typeof ColumnDimensionsFieldEndAdornment>[0]> = {}): ReturnType<typeof render> =>
  render(
    <ColumnDimensionsFieldEndAdornment
      axis="width"
      canFill
      canHug
      hasMax={false}
      hasMin={false}
      isRevealed={false}
      onMenuOpenChange={vi.fn()}
      onSelectSizingMode={vi.fn()}
      onToggleMax={vi.fn()}
      onToggleMin={vi.fn()}
      sizingMode={SizingMode.fixed}
      value={326}
      {...overrides}
    />,
  );

describe('ColumnDimensionsFieldEndAdornment', () => {
  it('should render nothing when no sizing mode is given', () => {
    // before
    const { container } = renderEndAdornment({ onSelectSizingMode: undefined, sizingMode: undefined });

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when no onSelectSizingMode handler is given', () => {
    // before
    const { container } = renderEndAdornment({ onSelectSizingMode: undefined });

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render the literal "Hug" text while hugging and not revealed', () => {
    // before
    renderEndAdornment({ isRevealed: false, sizingMode: SizingMode.hug });

    // result
    expect(screen.getByText('Hug')).toBeInTheDocument();
    expect(screen.queryByLabelText('Width sizing options')).toBeNull();
  });

  it('should render the chevron while hugging and revealed', () => {
    // before
    renderEndAdornment({ isRevealed: true, sizingMode: SizingMode.hug });

    // result
    expect(screen.queryByText('Hug')).toBeNull();
    expect(screen.getByLabelText('Width sizing options')).toBeInTheDocument();
  });

  it('should always render the chevron while fixed, revealed or not', () => {
    // before
    renderEndAdornment({ isRevealed: false, sizingMode: SizingMode.fixed });

    // result
    expect(screen.queryByText('Hug')).toBeNull();
    expect(screen.getByLabelText('Width sizing options')).toBeInTheDocument();
  });

  it('should render the literal "Fill" text while filling and not revealed', () => {
    // before
    renderEndAdornment({ isRevealed: false, sizingMode: SizingMode.fill });

    // result
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.queryByLabelText('Width sizing options')).toBeNull();
  });

  it('should render the chevron while filling and revealed', () => {
    // before
    renderEndAdornment({ isRevealed: true, sizingMode: SizingMode.fill });

    // result
    expect(screen.queryByText('Fill')).toBeNull();
    expect(screen.getByLabelText('Width sizing options')).toBeInTheDocument();
  });

  it('should use the height aria-label for the height axis', () => {
    // before
    renderEndAdornment({ axis: 'height' });

    // result
    expect(screen.getByLabelText('Height sizing options')).toBeInTheDocument();
  });

  it('should report the menu open state through onMenuOpenChange when the chevron is clicked', () => {
    // mock
    const onMenuOpenChange = vi.fn();

    // before
    renderEndAdornment({ onMenuOpenChange });

    // action
    fireEvent.click(screen.getByLabelText('Width sizing options'));

    // result
    expect(onMenuOpenChange).toHaveBeenCalledWith(true);
  });

  it('should dispatch the selected sizing mode when a menu item is clicked', () => {
    // mock
    const onSelectSizingMode = vi.fn();

    // before
    renderEndAdornment({ onSelectSizingMode });

    // action
    fireEvent.click(screen.getByLabelText('Width sizing options'));
    fireEvent.click(screen.getByText('Hug contents'));

    // result
    expect(onSelectSizingMode).toHaveBeenCalledWith(SizingMode.hug);
  });

  it('should not offer the Fill option in the menu when canFill is false', () => {
    // before
    renderEndAdornment({ canFill: false });

    // action
    fireEvent.click(screen.getByLabelText('Width sizing options'));

    // result
    expect(screen.queryByText('Fill container')).toBeNull();
  });

  it('should call onToggleMin when the Add min width item is clicked', () => {
    // mock
    const onToggleMin = vi.fn();

    // before
    renderEndAdornment({ onToggleMin });

    // action
    fireEvent.click(screen.getByLabelText('Width sizing options'));
    fireEvent.click(screen.getByText('Add min width…'));

    // result
    expect(onToggleMin).toHaveBeenCalledTimes(1);
  });

  it('should show the "Remove min width…" label once hasMin is true', () => {
    // before
    renderEndAdornment({ hasMin: true });

    // action
    fireEvent.click(screen.getByLabelText('Width sizing options'));

    // result
    expect(screen.getByText('Remove min width…')).toBeInTheDocument();
  });
});
