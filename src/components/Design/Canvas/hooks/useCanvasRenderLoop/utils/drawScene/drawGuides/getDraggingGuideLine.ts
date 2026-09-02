// types
import { NodeType } from 'types/design/enums';
import { TGuideDragState } from 'types/design/canvas/types';
import { TGuideLine } from 'types/design/guides/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getFrameGuideSpan } from 'store/design/utils/getFrameGuideSpan';

export const getDraggingGuideLine = (dragging: TGuideDragState, nodesById: Record<string, TSceneNode>): TGuideLine => {
  const { axis, frameId, id, position } = dragging;

  if (frameId !== null) {
    const frame = nodesById[frameId];
    const span = frame?.type === NodeType.frame ? getFrameGuideSpan(frame, axis) : null;

    return { axis, frameId, id: id ?? '', span, worldPosition: position };
  }

  return { axis, frameId: null, id: id ?? '', span: null, worldPosition: position };
};
