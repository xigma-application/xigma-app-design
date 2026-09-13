import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const anchorRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedIndices((current) => current.filter((index) => index < fillCount));
  }, [fillCount]);

  const onSelectRow = (index: number, modifiers: TFillSelectModifiers): void => {
    switch (true) {
      case modifiers.shift && anchorRef.current !== null:
        setSelectedIndices(getFillRangeIndices(anchorRef.current!, index));
        break;
      case modifiers.meta:
        setSelectedIndices((current) => getFillToggledIndices(current, index));
        anchorRef.current = index;
        break;
      default:
        setSelectedIndices([index]);
        anchorRef.current = index;
        break;
    }
  };

  const clearSelection = useCallback((): void => {
    setSelectedIndices((current) => (current.length === 0 ? current : []));
    anchorRef.current = null;
  }, []);

  const setSelection = useCallback((indices: number[]): void => {
    setSelectedIndices(indices);
    anchorRef.current = indices.length > 0 ? indices[indices.length - 1] : null;
  }, []);

  return { clearSelection, onSelectRow, selectedIndices, setSelection };
};
