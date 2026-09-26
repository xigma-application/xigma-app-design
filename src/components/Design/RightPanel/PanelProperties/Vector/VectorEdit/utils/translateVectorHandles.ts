// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getMirroredVectorSegments } from 'components/Design/Canvas/utils/getMirroredVectorSegments';
import { getVectorHandleVertexId } from './getVectorHandleVertexId';

export const translateVectorHandles = (dispatch: AppDispatch, node: TVectorNode, handles: TVectorHandleHover[], delta: TPoint): void => {
  const segments = handles.reduce((current, handle) => {
    const field = handle.end === 'start' ? 'tangentStart' : 'tangentEnd';
    const tangent = current[handle.segmentId][field]!;
    const vertexId = getVectorHandleVertexId(node, handle);

    return getMirroredVectorSegments(current, vertexId, node.vertexHandleModes[vertexId] ?? 'corner', handle.segmentId, field, {
      x: tangent.x + delta.x,
      y: tangent.y + delta.y,
    });
  }, node.segments);

  dispatch(updateNode({ changes: { segments }, id: node.id }));
};
