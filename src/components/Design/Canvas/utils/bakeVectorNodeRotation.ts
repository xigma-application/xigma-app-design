// types
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { rotateVectorNodeOrigin } from './rotateVectorNodeOrigin';

export const bakeVectorNodeRotation = (
  node: Pick<TVectorNode, 'rotation' | 'segments' | 'vertices'>,
): { rotation: number; segments: Record<string, TVectorSegment>; vertices: Record<string, TVectorVertex> } => {
  if (node.rotation) {
    const bounds = getVectorNodeBounds(node);
    const pivot = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

    return { rotation: 0, ...rotateVectorNodeOrigin(node, pivot, node.rotation) };
  }

  return { rotation: 0, segments: node.segments, vertices: node.vertices };
};
