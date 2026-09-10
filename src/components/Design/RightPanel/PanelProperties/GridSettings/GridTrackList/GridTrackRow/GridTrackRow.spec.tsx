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
  value: 1,
  ...overrides,
});

const renderRow = (props: Partial<Parameters<typeof GridTrackRow>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <GridTrackRow
        canDelete
        isDragging={false}
        isSelected={false}
        onChangeMode={vi.fn()}
        onChangeValue={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
        onStartDrag={vi.fn()}
        registerRow={vi.fn()}
        track={track()}
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

  it('should disable and blank the value field for a hug track', () => {
    renderRow({ track: track({ mode: SizingMode.hug, value: 0 }) });

    expect(screen.getByLabelText('Track size value')).toBeDisabled();
    expect(screen.getByLabelText('Track size value')).toHaveValue(null);
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

  it('should change the mode from the value field chevron menu', () => {
    const onChangeMode = vi.fn();

    renderRow({ onChangeMode });
    fireEvent.click(screen.getByLabelText('Track sizing mode'));
    fireEvent.click(screen.getByText('Hug'));

    expect(onChangeMode).toHaveBeenCalledWith(SizingMode.hug);
  });

  it('should delete the row from its own minus button, and disable it when it is the last track', () => {
    const onDelete = vi.fn();
    const { rerender } = renderRow({ onDelete });

    fireEvent.click(screen.getByRole('button', { name: 'Delete selected tracks' }));
    expect(onDelete).toHaveBeenCalled();

    rerender(
      <TooltipProvider>
        <GridTrackRow
          canDelete={false}
          isDragging={false}
          isSelected={false}
          onChangeMode={vi.fn()}
          onChangeValue={vi.fn()}
          onDelete={onDelete}
          onSelect={vi.fn()}
          onStartDrag={vi.fn()}
          registerRow={vi.fn()}
          track={track()}
        />
      </TooltipProvider>,
    );

    expect(screen.getByRole('button', { name: 'Delete selected tracks' })).toBeDisabled();
  });

  it('should reflect the selected and dragging states in its class list', () => {
    const { container, rerender } = renderRow();
    const base = (container.querySelector('[data-test-grid-track-row]') as HTMLElement).className;

    rerender(
      <TooltipProvider>
        <GridTrackRow
          canDelete
          isDragging
          isSelected
          onChangeMode={vi.fn()}
          onChangeValue={vi.fn()}
          onDelete={vi.fn()}
          onSelect={vi.fn()}
          onStartDrag={vi.fn()}
          registerRow={vi.fn()}
          track={track()}
        />
      </TooltipProvider>,
    );

    expect((container.querySelector('[data-test-grid-track-row]') as HTMLElement).className).not.toBe(base);
  });
});
