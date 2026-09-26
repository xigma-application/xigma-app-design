// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { translateVectorVertices } from 'components/Design/Canvas/utils/translateVectorVertices';

export const translateVectorPoints = (dispatch: AppDispatch, node: TVectorNode, vertexIds: string[], delta: TPoint): void => {
  const origins = Object.fromEntries(vertexIds.map((vertexId) => [vertexId, node.vertices[vertexId]]));

  dispatch(updateNode({ changes: { vertices: { ...node.vertices, ...translateVectorVertices(origins, delta.x, delta.y) } }, id: node.id }));
};
