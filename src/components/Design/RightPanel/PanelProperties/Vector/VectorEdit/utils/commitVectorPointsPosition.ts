// store
import { selectNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorPointsPosition } from './getVectorPointsPosition';
import { getVectorPointsPositionTarget } from './getVectorPointsPositionTarget';
import { translateVectorVertices } from 'components/Design/Canvas/utils/translateVectorVertices';

export const commitVectorPointsPosition = (
  dispatch: AppDispatch,
  nodeId: string,
  vertexIds: string[],
  axis: 'x' | 'y',
  value: number,
): void => {
  const nodes = selectNodes(store.getState());
  const node = nodes[nodeId] as TVectorNode;
  const origins = Object.fromEntries(vertexIds.map((vertexId) => [vertexId, node.vertices[vertexId]]));
  const position = getVectorPointsPosition(node, Object.values(origins), nodes);
  const delta = getVectorPointsPositionTarget(position, axis, value);
  const vertices = translateVectorVertices(origins, delta.x, delta.y);

  dispatch(updateNode({ changes: { vertices: { ...node.vertices, ...vertices } }, id: nodeId }));
};
