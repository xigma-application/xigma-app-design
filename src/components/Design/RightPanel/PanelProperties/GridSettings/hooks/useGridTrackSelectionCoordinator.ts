import { useState } from 'react';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export type TGridTrackSelectionCoordinator = {
  activeAxis: TGridTrackAxis | null;
  isSuppressed: (axis: TGridTrackAxis) => boolean;
  onSelectionChange: (axis: TGridTrackAxis, hasSelection: boolean) => void;
};

export const useGridTrackSelectionCoordinator = (): TGridTrackSelectionCoordinator => {
  const [activeAxis, setActiveAxis] = useState<TGridTrackAxis | null>('column');

  const onSelectionChange = (axis: TGridTrackAxis, hasSelection: boolean): void => {
    if (hasSelection) {
      setActiveAxis(axis);
    } else {
      setActiveAxis((current) => (current === axis ? null : current));
    }
  };

  return { activeAxis, isSuppressed: (axis) => activeAxis !== null && activeAxis !== axis, onSelectionChange };
};
