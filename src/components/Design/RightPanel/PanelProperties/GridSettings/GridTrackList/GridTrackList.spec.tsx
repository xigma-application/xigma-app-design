import { fireEvent, render, screen } from '@testing-library/react';

// components
import GridTrackList from './GridTrackList';
import { TooltipProvider } from 'shared';

// hooks
import { TGridAxisControls } from '../hooks/types';
import { TGridTrackSelectionCoordinator } from '../hooks/useGridTrackSelectionCoordinator';

const permissiveCoordinator = (): TGridTrackSelectionCoordinator => ({
  isSuppressed: () => false,
  onSelectionChange: vi.fn(),
});

const controls = (overrides: Partial<TGridAxisControls> = {}): TGridAxisControls => ({
  onAdd: vi.fn(),
  onChangeMode: vi.fn(),
  onChangeValue: vi.fn(),
  onDelete: vi.fn(),
  onReorder: vi.fn(() => [0]),
  revision: {},
  tracks: [
    { index: 0, mode: 'fill', value: 1 },
    { index: 1, mode: 'fixed', value: 40 },
  ] as TGridAxisControls['tracks'],
  ...overrides,
});

const renderList = (props: Partial<Parameters<typeof GridTrackList>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <GridTrackList
        addAriaLabel="Add column"
        axis="column"
        controls={controls()}
        coordinator={permissiveCoordinator()}
        e2eValue="grid-columns"
        label="Columns"
        {...props}
      />
    </TooltipProvider>,
  );

describe('GridTrackList', () => {
  it('should render one row per track under its section label', () => {
    renderList();

    expect(screen.getByText('Columns')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Reorder track' })).toHaveLength(2);
  });

  it('should start with the given initial selection', () => {
    const plain = renderList().container.querySelector('[data-test-grid-track-row="0"]')?.className;
    const selected = renderList({ initialSelectedIndices: [0] }).container.querySelector('[data-test-grid-track-row="0"]')?.className;

    expect(selected).not.toBe(plain);
  });

  it('should add a track from the section plus button', () => {
    const onAdd = vi.fn();

    renderList({ controls: controls({ onAdd }) });
    fireEvent.click(screen.getByRole('button', { name: 'Add column' }));

    expect(onAdd).toHaveBeenCalled();
  });

  it('should delete a track from that row’s own minus button', () => {
    const onDelete = vi.fn();

    renderList({ controls: controls({ onDelete }) });
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete selected tracks' })[1]);

    expect(onDelete).toHaveBeenCalledWith([1]);
  });

  it('should disable every row’s minus button when only one track is left', () => {
    renderList({ controls: controls({ tracks: [{ index: 0, mode: 'fill', value: 1 }] as TGridAxisControls['tracks'] }) });

    expect(screen.getByRole('button', { name: 'Delete selected tracks' })).toBeDisabled();
  });

  it('should forward a row’s mode and value changes with that row’s index', () => {
    const onChangeMode = vi.fn();
    const onChangeValue = vi.fn();

    renderList({ controls: controls({ onChangeMode, onChangeValue }) });

    fireEvent.blur(screen.getAllByLabelText('Track size value')[1], { target: { value: '64' } });
    expect(onChangeValue).toHaveBeenCalledWith(1, 64);

    fireEvent.click(screen.getAllByLabelText('Track sizing mode')[0]);
    fireEvent.click(screen.getByText('Hug'));
    expect(onChangeMode).toHaveBeenCalledWith(0, 'hug');
  });

  it('should show a drop indicator at the grabbed row and past the end while dragging', () => {
    const { container } = renderList();
    const rowCount = (): number => container.querySelectorAll('[data-test-grid-track-row]').length;
    const before = container.querySelectorAll('div').length;

    fireEvent.pointerDown(screen.getAllByRole('button', { name: 'Reorder track' })[0]);

    // indicator inserted at the grabbed row's position
    expect(container.querySelectorAll('div').length).toBeGreaterThan(before);

    fireEvent(window, new PointerEvent('pointermove', { clientY: 999 }));

    // still two rows, now with a trailing indicator
    expect(rowCount()).toBe(2);

    fireEvent(window, new PointerEvent('pointerup'));
  });
});
