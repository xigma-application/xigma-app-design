import { useCallback, useEffect, useRef } from 'react';

// store
import { selectSelectedFillIndices, selectSelectedStrokeIndices } from 'store/design/selectors';
import { setSelectedFillIndices, setSelectedStrokeIndices } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TPaintProperty } from 'types/design/paint/types';

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

export const useFillSelection = (fillCount: number, property: TPaintProperty = 'fills'): TUseFillSelectionResult => {
  const dispatch = useAppDispatch();
  const isStrokes = property === 'strokes';
  const selectedIndices = useAppSelector(isStrokes ? selectSelectedStrokeIndices : selectSelectedFillIndices);
  const setSelectedIndices = isStrokes ? setSelectedStrokeIndices : setSelectedFillIndices;
  const anchorRef = useRef<number | null>(null);

  useEffect(() => {
    const trimmed = selectedIndices.filter((index) => index < fillCount);

    if (trimmed.length !== selectedIndices.length) {
      dispatch(setSelectedIndices(trimmed));
    }
  }, [dispatch, fillCount, selectedIndices, setSelectedIndices]);

  const onSelectRow = (index: number, modifiers: TFillSelectModifiers): void => {
    switch (true) {
      case modifiers.shift && anchorRef.current !== null:
        dispatch(setSelectedIndices(getFillRangeIndices(anchorRef.current!, index)));
        break;
      case modifiers.meta:
        dispatch(setSelectedIndices(getFillToggledIndices(selectedIndices, index)));
        anchorRef.current = index;
        break;
      default:
        dispatch(setSelectedIndices([index]));
        anchorRef.current = index;
        break;
    }
  };

  const clearSelection = useCallback((): void => {
    dispatch(setSelectedIndices([]));
    anchorRef.current = null;
  }, [dispatch, setSelectedIndices]);

  const setSelection = useCallback(
    (indices: number[]): void => {
      dispatch(setSelectedIndices(indices));
      anchorRef.current = indices.length > 0 ? indices[indices.length - 1] : null;
    },
    [dispatch, setSelectedIndices],
  );

  return { clearSelection, onSelectRow, selectedIndices, setSelection };
};
