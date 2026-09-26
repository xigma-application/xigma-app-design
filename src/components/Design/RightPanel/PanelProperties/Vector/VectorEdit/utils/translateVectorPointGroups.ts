// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';
import { TVectorPointGroup } from '../types';

export const translateVectorPointGroups = (
  dispatch: AppDispatch,
  node: TVectorNode,
  groups: TVectorPointGroup[],
  deltas: TPoint[],
): void => {
  const vertices = Object.fromEntries(
    groups.flatMap(({ vertexIds }, index) =>
      vertexIds.map((vertexId) => {
        const vertex = node.vertices[vertexId];
        return [vertexId, { ...vertex, x: vertex.x + deltas[index].x, y: vertex.y + deltas[index].y }];
      }),
    ),
  );

  dispatch(updateNode({ changes: { vertices: { ...node.vertices, ...vertices } }, id: node.id }));
};
