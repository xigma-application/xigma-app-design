import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../hooks/types';

// types
import { SizingMode } from 'types/design/enums';

export const commitGridTrackModeChange = (
  controls: TGridAxisControls,
  isSelfChangeRef: RefObject<boolean>,
  selectedIndices: number[],
  index: number,
  mode: SizingMode,
  value?: number,
): void => {
  isSelfChangeRef.current = true;
  const indices = selectedIndices.includes(index) ? selectedIndices : [index];
  controls.onChangeMode(indices, mode, value);
};
