// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const isAutoLayoutDropTargetActive = (canvasRefs: TCanvasRefs): boolean =>
  canvasRefs.transform.autoLayoutReorderPreviewRef.current !== null || canvasRefs.transform.autoLayoutDropTargetRef.current !== null;
