// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TFrameNode } from 'types/design/types';
import { TNewNodeDropTarget } from './types';

export const resolveFreeformNewNodeTarget = (canvasRefs: TCanvasRefs, frame: TFrameNode): TNewNodeDropTarget => {
  canvasRefs.transform.autoLayoutDropTargetRef.current = null;
  canvasRefs.transform.gridDropTargetRef.current = null;

  return { parentId: frame.id, targetIndex: frame.childIds.length };
};
