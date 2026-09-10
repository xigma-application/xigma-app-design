import { useEffect } from 'react';

// store
import { setGridSectionHighlight } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { TGridCellPosition } from 'types/design/canvas/types';

export const useGridSectionHighlight = (frameId: string | null, columnCells: TGridCellPosition[], rowCells: TGridCellPosition[]): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (frameId) {
      const cells = [...columnCells, ...rowCells];

      dispatch(setGridSectionHighlight(cells.length > 0 ? { cells, frameId } : null));
    }
  }, [columnCells, dispatch, frameId, rowCells]);

  useEffect(
    () => (): void => {
      dispatch(setGridSectionHighlight(null));
    },
    [dispatch],
  );
};
