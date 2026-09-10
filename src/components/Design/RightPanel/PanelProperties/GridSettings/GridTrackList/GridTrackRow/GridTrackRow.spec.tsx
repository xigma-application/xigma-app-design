import { fireEvent, render, screen } from '@testing-library/react';

// components
import GridTrackRow from './GridTrackRow';
import { TooltipProvider } from 'shared';

// hooks
import { TGridTrackViewModel } from '../../hooks/types';

// types
import { SizingMode } from 'types/design/enums';

const track = (overrides: Partial<TGridTrackViewModel> = {}): TGridTrackViewModel => ({
  index: 0,
  linkedIndices: [0],
  mode: SizingMode.fill,
  resolvedSize: 100,
  value: 1,
  ...overrides,
});

const renderRow = (props: Partial<Parameters<typeof GridTrackRow>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <GridTrackRow
        axis="column"
        canDelete
        isDragging={false}
        isSelected={false}
        onChangeMode={vi.fn()}
        onChangeValue={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
        onStartDrag={vi.fn()}
        registerRow={vi.fn()}
        selectedCount={1}
        track={track()}
        trackCount={3}
        {...props}
      />
    </TooltipProvider>,
  );

describe('GridTrackRow', () => {
  it('should render the handle number, the mode label and the value', () => {
    renderRow();

    expect(screen.getByRole('button', { name: 'Reorder track' })).toHaveTextContent('1');
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getByLabelText('Track size value')).toHaveValue(1);
  });

  it('should let global keyboard shortcuts (e.g. undo) through the value field and mode dropdown', () => {
    renderRow();

    expect(screen.getByLabelText('Track size value')).not.toHaveAttribute('data-test-bypass-global-shortcuts');
    expect(screen.getByText('Fill').closest('[data-test-bypass-global-shortcuts]')).toBeNull();
  });

  it('should show the resolved size in a still-editable value field for a hug track', () => {
    const onChangeMode = vi.fn();

    renderRow({ onChangeMode, track: track({ mode: SizingMode.hug, resolvedSize: 276.5, value: 0 }) });
    const input = screen.getByLabelText('Track size value');

    expect(input).not.toBeDisabled();
    expect(input).toHaveValue(276.5);

    // typing a value and committing switches the track to fixed at that value
    fireEvent.blur(input, { target: { value: '300' } });
    expect(onChangeMode).toHaveBeenCalledWith(SizingMode.fixed, 300);
  });

  it('should not render a mode chevron menu inside the value field', () => {
    renderRow();

    expect(screen.queryByLabelText('Track sizing mode')).not.toBeInTheDocument();
  });

  it('should seed the resolved size when switching to Fixed from the mode dropdown', () => {
    const onChangeMode = vi.fn();

    renderRow({ onChangeMode, track: track({ mode: SizingMode.fill, resolvedSize: 646.33, value: 1 }) });
    fireEvent.click(screen.getByText('Fill', { exact: true }));
    fireEvent.click(screen.getByText('Fixed width (646.33)'));

    expect(onChangeMode).toHaveBeenCalledWith(SizingMode.fixed, 646.33);
  });

  it('should not pass a value when switching to a non-Fixed mode from the dropdown', () => {
    const onChangeMode = vi.fn();

    renderRow({ onChangeMode, track: track({ mode: SizingMode.fill, resolvedSize: 646.33, value: 1 }) });
    fireEvent.click(screen.getByText('Fill', { exact: true }));
    fireEvent.click(screen.getByText('Hug contents'));

    expect(onChangeMode).toHaveBeenCalledWith(SizingMode.hug, undefined);
  });

  it('should not switch a hug track to fixed on a blank blur', () => {
    const onChangeMode = vi.fn();

    renderRow({ onChangeMode, track: track({ mode: SizingMode.hug, value: 0 }) });

    fireEvent.blur(screen.getByLabelText('Track size value'), { target: { value: '' } });
    expect(onChangeMode).not.toHaveBeenCalled();
  });

  it('should report the click modifiers when the row is clicked', () => {
    const onSelect = vi.fn();
    const { container } = renderRow({ onSelect });

    fireEvent.click(container.querySelector('[data-test-grid-track-row]') as HTMLElement, { metaKey: true });

    expect(onSelect).toHaveBeenCalledWith({ meta: true, shift: false });
  });

  it('should commit a numeric value on blur and ignore a blank one', () => {
    const onChangeValue = vi.fn();

    renderRow({ onChangeValue });
    const input = screen.getByLabelText('Track size value');

    fireEvent.blur(input, { target: { value: '3.5' } });
    expect(onChangeValue).toHaveBeenCalledWith(3.5);

    fireEvent.blur(input, { target: { value: '' } });
    expect(onChangeValue).toHaveBeenCalledTimes(1);
  });

  it('should delete the row from its own minus button, and disable it when it is the last track', () => {
    const onDelete = vi.fn();
    const { rerender } = renderRow({ onDelete });

    fireEvent.click(screen.getByRole('button', { name: 'Delete selected tracks' }));
    expect(onDelete).toHaveBeenCalled();

    rerender(
      <TooltipProvider>
        <GridTrackRow
          axis="column"
          canDelete={false}
          isDragging={false}
          isSelected={false}
          onChangeMode={vi.fn()}
          onChangeValue={vi.fn()}
          onDelete={onDelete}
          onSelect={vi.fn()}
          onStartDrag={vi.fn()}
          registerRow={vi.fn()}
          selectedCount={1}
          track={track()}
          trackCount={3}
        />
      </TooltipProvider>,
    );

    expect(screen.getByRole('button', { name: 'Delete selected tracks' })).toBeDisabled();
  });

  it('should show a position-aware remove tooltip on the minus button for a column track', async () => {
    renderRow({ axis: 'column', track: track({ index: 1 }), trackCount: 3 });

    fireEvent.focus(screen.getByRole('button', { name: 'Delete selected tracks' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Remove column 2 of 3');
  });

  it('should word the remove tooltip for a row track', async () => {
    renderRow({ axis: 'row', track: track({ index: 0 }), trackCount: 2 });

    fireEvent.focus(screen.getByRole('button', { name: 'Delete selected tracks' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Remove row 1 of 2');
  });

  it('should switch the remove tooltip to a count when this row is part of a multi-selection', async () => {
    renderRow({ axis: 'column', isSelected: true, selectedCount: 2, track: track({ index: 0 }), trackCount: 4 });

    fireEvent.focus(screen.getByRole('button', { name: 'Delete selected tracks' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Remove 2 columns');
  });

  it('should keep the single-track remove wording when the row itself is not in the multi-selection', async () => {
    renderRow({ axis: 'column', isSelected: false, selectedCount: 2, track: track({ index: 2 }), trackCount: 4 });

    fireEvent.focus(screen.getByRole('button', { name: 'Delete selected tracks' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Remove column 3 of 4');
  });

  it('should reflect the selected and dragging states in its class list', () => {
    const { container, rerender } = renderRow();
    const base = (container.querySelector('[data-test-grid-track-row]') as HTMLElement).className;

    rerender(
      <TooltipProvider>
        <GridTrackRow
          axis="column"
          canDelete
          isDragging
          isSelected
          onChangeMode={vi.fn()}
          onChangeValue={vi.fn()}
          onDelete={vi.fn()}
          onSelect={vi.fn()}
          onStartDrag={vi.fn()}
          registerRow={vi.fn()}
          selectedCount={1}
          track={track()}
          trackCount={3}
        />
      </TooltipProvider>,
    );

    expect((container.querySelector('[data-test-grid-track-row]') as HTMLElement).className).not.toBe(base);
  });
});
