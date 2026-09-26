// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { useAppDispatch } from 'store';

export type TVectorPointsHistory = { begin: TFunc; end: TFunc; run: TFunc<[TFunc]> };

export const useVectorPointsHistory = (): TVectorPointsHistory => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  const begin = (): void => {
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
  };

  const end = (): void => {
    refs.vectorMultiSelect.vectorMultiSelectBoxRef.current = null;
    dispatch(endHistoryGesture());
  };

  const run = (change: TFunc): void => {
    begin();
    change();
    end();
  };

  return { begin, end, run };
};
