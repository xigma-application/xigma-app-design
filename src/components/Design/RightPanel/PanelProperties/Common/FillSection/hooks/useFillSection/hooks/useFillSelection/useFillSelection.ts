import { useCallback, useEffect, useRef } from 'react';

// store
import { selectSelectedFillIndices } from 'store/design/selectors';
import { setSelectedFillIndices } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// utils
import { getFillRangeIndices } from './utils/getFillRangeIndices';
import { getFillToggledIndices } from './utils/getFillToggledIndices';

export type TFillSelectModifiers = { meta: boolean; shift: boolean };

export type TUseFillSelectionResult = {
  clearSelection: TFunc;
  onSelectRow: TFunc<[number, TFillSelectModifiers]>;
  selectedIndices: number[];
  setSelection: TFunc<[number[]]>;
};

export const useFillSelection = (fillCount: number): TUseFillSelectionResult => {
  const dispatch = useAppDispatch();
  const selectedIndices = useAppSelector(selectSelectedFillIndices);
  const anchorRef = useRef<number | null>(null);

  useEffect(() => {
    const trimmed = selectedIndices.filter((index) => index < fillCount);

    if (trimmed.length !== selectedIndices.length) {
      dispatch(setSelectedFillIndices(trimmed));
    }
  }, [dispatch, fillCount, selectedIndices]);

  const onSelectRow = (index: number, modifiers: TFillSelectModifiers): void => {
    switch (true) {
      case modifiers.shift && anchorRef.current !== null:
        dispatch(setSelectedFillIndices(getFillRangeIndices(anchorRef.current!, index)));
        break;
      case modifiers.meta:
        dispatch(setSelectedFillIndices(getFillToggledIndices(selectedIndices, index)));
        anchorRef.current = index;
        break;
      default:
        dispatch(setSelectedFillIndices([index]));
        anchorRef.current = index;
        break;
    }
  };

  const clearSelection = useCallback((): void => {
    dispatch(setSelectedFillIndices([]));
    anchorRef.current = null;
  }, [dispatch]);

  const setSelection = useCallback(
    (indices: number[]): void => {
      dispatch(setSelectedFillIndices(indices));
      anchorRef.current = indices.length > 0 ? indices[indices.length - 1] : null;
    },
    [dispatch],
  );

  return { clearSelection, onSelectRow, selectedIndices, setSelection };
};
