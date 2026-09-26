// store
import { selectNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getMirroredVectorSegments } from 'components/Design/Canvas/utils/getMirroredVectorSegments';
import { getVectorHandlePoint } from './getVectorHandlePoint';
import { getVectorHandleVertexId } from './getVectorHandleVertexId';
import { getVectorPointsPosition } from './getVectorPointsPosition';
import { getVectorPointsPositionTarget } from './getVectorPointsPositionTarget';

export const commitVectorHandlesPosition = (
  dispatch: AppDispatch,
  nodeId: string,
  handles: TVectorHandleHover[],
  axis: 'x' | 'y',
  value: number,
): void => {
  const nodes = selectNodes(store.getState());
  const node = nodes[nodeId] as TVectorNode;
  
  const delta = getVectorPointsPositionTarget(
    getVectorPointsPosition(
      node,
      handles.map((handle) => getVectorHandlePoint(node, handle)),
      nodes,
    ),
    axis,
    value,
  );

  const segments = handles.reduce((current, handle) => {
    const field = handle.end === 'start' ? 'tangentStart' : 'tangentEnd';
    const tangent = current[handle.segmentId][field]!;
    const vertexId = getVectorHandleVertexId(node, handle);

    return getMirroredVectorSegments(current, vertexId, node.vertexHandleModes[vertexId] ?? 'corner', handle.segmentId, field, {
      x: tangent.x + delta.x,
      y: tangent.y + delta.y,
    });
  }, node.segments);

  dispatch(updateNode({ changes: { segments }, id: nodeId }));
};
