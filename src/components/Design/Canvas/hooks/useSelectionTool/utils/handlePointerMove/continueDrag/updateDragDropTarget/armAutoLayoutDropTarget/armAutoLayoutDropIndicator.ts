// types
import { TAutoLayoutDropTarget } from 'store/design/utils/autoLayout/getAutoLayoutDropTarget/getAutoLayoutDropTarget';
import { TCanvasRefs } from 'types/design/canvas/types';

export const armAutoLayoutDropIndicator = (canvasRefs: TCanvasRefs, desiredParentId: string, dropTarget: TAutoLayoutDropTarget): void => {
  canvasRefs.transform.autoLayoutReorderPreviewRef.current = null;
  canvasRefs.transform.autoLayoutDropTargetRef.current = { frameId: desiredParentId, ...dropTarget };
};
