import { useCallback, useMemo, useState } from 'react';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export type TGridTrackSelectionCoordinator = {
  activeAxis: TGridTrackAxis | null;
  isSuppressed: (axis: TGridTrackAxis) => boolean;
  onSelectionChange: (axis: TGridTrackAxis, hasSelection: boolean) => void;
};

export const useGridTrackSelectionCoordinator = (): TGridTrackSelectionCoordinator => {
  const [activeAxis, setActiveAxis] = useState<TGridTrackAxis | null>('column');

  const onSelectionChange = useCallback((axis: TGridTrackAxis, hasSelection: boolean): void => {
    if (hasSelection) {
      setActiveAxis(axis);
    } else {
      setActiveAxis((current) => (current === axis ? null : current));
    }
  }, []);

  const isSuppressed = useCallback((axis: TGridTrackAxis): boolean => activeAxis !== null && activeAxis !== axis, [activeAxis]);

  return useMemo(() => ({ activeAxis, isSuppressed, onSelectionChange }), [activeAxis, isSuppressed, onSelectionChange]);
};
