import { PointerEvent as ReactPointerEvent } from 'react';

// utils
import { resolveFillDragIndices } from '../../../../FillSection/hooks/useFillSection/utils/resolveFillDragIndices';

export const handleEffectStartDrag = (
  index: number,
  event: ReactPointerEvent,
  closeOpenPanel: TFunc,
  selectedIndices: number[],
  setSelectedIndices: TFunc<[number[]]>,
  beginDrag: TFunc<[number[], number, ReactPointerEvent]>,
): void => {
  closeOpenPanel();
  beginDrag(resolveFillDragIndices(selectedIndices, setSelectedIndices, index), index, event);
};
