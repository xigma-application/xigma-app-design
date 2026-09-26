// store
import { selectNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { getNodeAbsoluteFromParentPosition } from 'store/design/utils/getNodeAbsoluteFromParentPosition';
import { getVectorPointsPosition } from './getVectorPointsPosition';
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
  const position = getVectorPointsPosition(node, vertexIds, nodes);
  const local = { ...position, [axis]: value };
  const target = position.parent ? getNodeAbsoluteFromParentPosition(local, position.parent) : local;
  const origins = Object.fromEntries(vertexIds.map((vertexId) => [vertexId, node.vertices[vertexId]]));
  const vertices = translateVectorVertices(origins, target.x - position.origin.x, target.y - position.origin.y);

  dispatch(updateNode({ changes: { vertices: { ...node.vertices, ...vertices } }, id: nodeId }));
};
