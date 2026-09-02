// store
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TAspectRatioLockGuide } from 'types/canvas';
import { TBoxSceneNode } from 'types/design/types';
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';

type TSingleRotatableOrigin = Exclude<TResizeNodeOrigin, { x1: number; x2: number; y1: number; y2: number }> | null;

export const getAspectRatioLockGuide = (
  isAspectLocked: boolean,
  singleRotatableOrigin: TSingleRotatableOrigin,
  nodeId: string | undefined,
): TAspectRatioLockGuide | null => {
  if (!isAspectLocked || !singleRotatableOrigin || !('width' in singleRotatableOrigin) || !nodeId) {
    return null;
  }

  const node = selectNodes(store.getState())[nodeId] as TBoxSceneNode | undefined;
  return node ? { height: node.height, rotation: node.rotation, width: node.width, x: node.x, y: node.y } : null;
};
