// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const clearNewNodeDropTarget = (canvasRefs: TCanvasRefs): void => {
  canvasRefs.transform.dropTargetFrameIdRef.current = null;
  canvasRefs.transform.autoLayoutDropTargetRef.current = null;
  canvasRefs.transform.gridDropTargetRef.current = null;
  canvasRefs.transform.autoLayoutReorderPreviewRef.current = null;
};
