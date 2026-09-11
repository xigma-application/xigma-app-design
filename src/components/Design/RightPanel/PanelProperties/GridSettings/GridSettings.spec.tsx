import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactElement } from 'react';

// components
import GridSettings from './GridSettings';
import { TooltipProvider } from 'shared';

// store
import {
  addNode,
  setGridSectionHighlight,
  setGridSettingsPanelOpen,
  setGridTrackSelection,
  setPanelGridTrackSelection,
  setSelection,
  updateNode,
} from 'store/design/slice';
import {
  selectActivePage,
  selectGridSectionHighlight,
  selectGridTrackSelection,
  selectIsGridSettingsPanelOpen,
} from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

const renderGridSettings = (ui: ReactElement = <GridSettings />): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>{ui}</TooltipProvider>
    </Provider>,
  );

const selectGridFrame = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      height: 200,
      layoutMode: LayoutMode.grid,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 200,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const frameId = rootOrder[rootOrder.length - 1];

  store.dispatch(updateNode({ changes: { gridColumnCount: 3, gridRowCount: 2 }, id: frameId }));
  store.dispatch(setSelection([frameId]));
  store.dispatch(setGridSettingsPanelOpen(true));

  return frameId;
};

describe('GridSettings', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setGridSettingsPanelOpen(false));
    store.dispatch(setGridSectionHighlight(null));
    store.dispatch(setGridTrackSelection(null));
    store.dispatch(setPanelGridTrackSelection(null));
  });

  it('should render the header and one row per column and row track', () => {
    selectGridFrame();

    renderGridSettings();

    expect(screen.getByText('Grid')).toBeInTheDocument();
    expect(screen.getByText('Columns')).toBeInTheDocument();
    expect(screen.getByText('Rows')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Reorder track' })).toHaveLength(5);
  });

  it('should label each list’s plus button with its own add tooltip', async () => {
    selectGridFrame();

    renderGridSettings();
    fireEvent.focus(screen.getByRole('button', { name: 'Add row' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Add row');
  });

  it('should give a column row’s minus button a position-aware remove tooltip', async () => {
    selectGridFrame();

    renderGridSettings();
    fireEvent.focus(screen.getAllByRole('button', { name: 'Delete selected tracks' })[0]);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Remove column 1 of 3');
  });

  it('should publish the pre-selected column’s cells as the canvas grid-section highlight', () => {
    const frameId = selectGridFrame();

    renderGridSettings();

    expect(selectGridSectionHighlight(store.getState())).toEqual({
      cells: [
        { column: 0, row: 0 },
        { column: 0, row: 1 },
      ],
      frameId,
    });
  });

  it('should clear the grid-section highlight when the panel unmounts', () => {
    selectGridFrame();

    const { unmount } = renderGridSettings();
    unmount();

    expect(selectGridSectionHighlight(store.getState())).toBeNull();
  });

  it('should close the panel from the header', () => {
    selectGridFrame();

    renderGridSettings();
    fireEvent.click(screen.getByRole('button', { name: 'Close grid settings' }));

    expect(selectIsGridSettingsPanelOpen(store.getState())).toBe(false);
  });

  it('should select the matching column row when a track selection is dispatched from outside the panel (e.g. a canvas click)', () => {
    const frameId = selectGridFrame();

    const { container } = renderGridSettings();

    act(() => {
      store.dispatch(setPanelGridTrackSelection({ axis: 'column', frameId, indices: [2] }));
    });

    expect(container.querySelector('[data-test-grid-track-row="2"]')?.className).toContain('GridTrackRow--selected');
    expect(container.querySelector('[data-test-grid-track-row="0"]')?.className).not.toContain('GridTrackRow--selected');
  });

  it('should select the matching row-list row when a row-axis track selection is dispatched from outside the panel', async () => {
    const frameId = selectGridFrame();

    const { container } = renderGridSettings();

    act(() => {
      store.dispatch(setPanelGridTrackSelection({ axis: 'row', frameId, indices: [1] }));
    });

    await waitFor(() => {
      const rowRows = container.querySelectorAll('[data-test-grid-track-row]');
      const rowListSecondRow = Array.from(rowRows).filter((row) => row.getAttribute('data-test-grid-track-row') === '1')[1];

      expect(rowListSecondRow?.className).toContain('GridTrackRow--selected');
    });
  });

  it('should ignore a track selection dispatched for a different frame', () => {
    selectGridFrame();

    const { container } = renderGridSettings();

    act(() => {
      store.dispatch(setPanelGridTrackSelection({ axis: 'column', frameId: 'other-frame', indices: [2] }));
    });

    expect(container.querySelector('[data-test-grid-track-row="0"]')?.className).toContain('GridTrackRow--selected');
    expect(container.querySelector('[data-test-grid-track-row="2"]')?.className).not.toContain('GridTrackRow--selected');
  });

  it('should switch the published track selection back to a column after a row was the active axis', () => {
    const frameId = selectGridFrame();

    const { container } = renderGridSettings();
    const rowRows = Array.from(container.querySelectorAll('[data-test-grid-track-row="0"]'));

    act(() => {
      fireEvent.click(rowRows[1]);
    });

    act(() => {
      fireEvent.click(container.querySelector('[data-test-grid-track-row="1"]') as Element);
    });

    expect(selectGridTrackSelection(store.getState())).toEqual({ axis: 'column', frameId, indices: [1] });
  });

  it('should show every selected column as expanded/selected when a multi-track selection is dispatched from outside the panel', () => {
    const frameId = selectGridFrame();

    const { container } = renderGridSettings();

    act(() => {
      store.dispatch(setPanelGridTrackSelection({ axis: 'column', frameId, indices: [0, 2] }));
    });

    expect(container.querySelector('[data-test-grid-track-row="0"]')?.className).toContain('GridTrackRow--selected');
    expect(container.querySelector('[data-test-grid-track-row="1"]')?.className).not.toContain('GridTrackRow--selected');
    expect(container.querySelector('[data-test-grid-track-row="2"]')?.className).toContain('GridTrackRow--selected');
  });

  it('should clear the published track selection once the only selected row is toggled off', () => {
    selectGridFrame();

    const { container } = renderGridSettings();

    act(() => {
      fireEvent.click(container.querySelector('[data-test-grid-track-row="0"]') as Element, { metaKey: true });
    });

    expect(selectGridTrackSelection(store.getState())).toBeNull();
  });

  it('should match the snapshot', () => {
    selectGridFrame();

    const { asFragment } = renderGridSettings();

    expect(asFragment()).toMatchSnapshot();
  });
});
