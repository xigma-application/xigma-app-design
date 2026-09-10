import { useCallback, useEffect, useRef, useState } from 'react';

// utils
import { getGridTrackRangeIndices } from '../utils/getGridTrackRangeIndices';
import { getGridTrackToggledIndices } from '../utils/getGridTrackToggledIndices';

export type TGridTrackSelectModifiers = {
  meta: boolean;
  shift: boolean;
};

export type TUseGridTrackSelectionResult = {
  clearSelection: TFunc;
  onSelectRow: TFunc<[number, TGridTrackSelectModifiers]>;
  selectedIndices: number[];
  setSelection: TFunc<[number[]]>;
};

export const useGridTrackSelection = (trackCount: number, initialIndices: number[] = []): TUseGridTrackSelectionResult => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>(initialIndices);
  const anchorRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedIndices((current) => current.filter((index) => index < trackCount));
  }, [trackCount]);

  const onSelectRow = (index: number, modifiers: TGridTrackSelectModifiers): void => {
    switch (true) {
      case modifiers.shift && anchorRef.current !== null:
        setSelectedIndices(getGridTrackRangeIndices(anchorRef.current!, index));
        break;
      case modifiers.meta:
        setSelectedIndices((current) => getGridTrackToggledIndices(current, index));
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
