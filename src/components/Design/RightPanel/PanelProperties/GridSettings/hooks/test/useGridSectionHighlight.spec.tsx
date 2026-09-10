import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useGridSectionHighlight } from '../useGridSectionHighlight';

// store
import { selectGridSectionHighlight } from 'store/design/selectors';
import { store } from 'store';

// types
import { TGridCellPosition } from 'types/design/canvas/types';

type TProps = { columnCells: TGridCellPosition[]; frameId: string | null; rowCells: TGridCellPosition[] };

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const render = (
  frameId: string | null,
  columnCells: TGridCellPosition[],
  rowCells: TGridCellPosition[],
): ReturnType<typeof renderHook<void, TProps>> =>
  renderHook(({ columnCells: columns, frameId: id, rowCells: rows }) => useGridSectionHighlight(id, columns, rows), {
    initialProps: { columnCells, frameId, rowCells },
    wrapper,
  });

describe('useGridSectionHighlight', () => {
  it('should publish the combined column and row cells for the given frame', () => {
    render('frame-1', [{ column: 0, row: 0 }], [{ column: 1, row: 1 }]);

    expect(selectGridSectionHighlight(store.getState())).toEqual({
      cells: [
        { column: 0, row: 0 },
        { column: 1, row: 1 },
      ],
      frameId: 'frame-1',
    });
  });

  it('should clear the highlight when there is no frame', () => {
    render(null, [], []);

    expect(selectGridSectionHighlight(store.getState())).toBeNull();
  });

  it('should clear the highlight when there are no cells to highlight', () => {
    render('frame-1', [], []);

    expect(selectGridSectionHighlight(store.getState())).toBeNull();
  });

  it('should clear the highlight when the hook unmounts', () => {
    const { unmount } = render('frame-1', [{ column: 0, row: 0 }], []);

    unmount();

    expect(selectGridSectionHighlight(store.getState())).toBeNull();
  });
});
