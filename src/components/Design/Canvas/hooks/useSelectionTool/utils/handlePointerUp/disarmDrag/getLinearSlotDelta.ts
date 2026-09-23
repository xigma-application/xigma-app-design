// types
import { LayoutMode } from 'types/design/enums';
import { TAutoLayoutFrame } from '../../handlePointerMove/continueDrag/updateDragDropTarget/types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSlotDelta } from './types';

// utils
import { getAutoLayoutOriginalIndex } from '../../handlePointerMove/continueDrag/updateDragDropTarget/armAutoLayoutDropTarget/getAutoLayoutOriginalIndex';

export const getLinearSlotDelta = (frame: TAutoLayoutFrame, orderedIds: string[], canvasRefs: TCanvasRefs): TSlotDelta => {
  const preview = canvasRefs.transform.autoLayoutReorderPreviewRef.current;
  const dropTarget = canvasRefs.transform.autoLayoutDropTargetRef.current;
  const landingIndex = preview?.frameId === frame.id ? preview.activeIndex : dropTarget?.frameId === frame.id ? dropTarget.index : null;
  const steps = landingIndex === null ? 0 : landingIndex - getAutoLayoutOriginalIndex(frame.childIds, orderedIds);

  return frame.layoutMode === LayoutMode.horizontal ? { steps, x: steps, y: 0 } : { steps, x: 0, y: steps };
};
