import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../hooks/types';

export const commitGridTrackValueChange = (
  controls: TGridAxisControls,
  isSelfChangeRef: RefObject<boolean>,
  selectedIndices: number[],
  index: number,
  value: number,
): void => {
  isSelfChangeRef.current = true;
  const indices = selectedIndices.includes(index) ? selectedIndices : [index];
  controls.onChangeValue(indices, index, value);
};
