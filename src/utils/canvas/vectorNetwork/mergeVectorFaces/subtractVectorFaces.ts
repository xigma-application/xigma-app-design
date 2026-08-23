// types
import { TVectorNode } from 'types/design/types';
import { TVectorFace } from '../deriveVectorFaces';

// utils
import { getExclusiveSegmentIds } from './getExclusiveSegmentIds';
import { getRemainingVertices } from '../getRemainingVertices';
import { getVectorFillLoopKey } from '../getVectorFillLoopKey';

export const subtractVectorFaces = (node: TVectorNode, touchedFaces: TVectorFace[]): TVectorNode => {
  const exclusiveSegmentIds = getExclusiveSegmentIds(node, touchedFaces);
  const segments = Object.fromEntries(Object.entries(node.segments).filter(([id]) => !exclusiveSegmentIds.includes(id)));
  const vertices = getRemainingVertices(node.vertices, segments);
  const touchedLoopKeys = new Set(touchedFaces.map((face) => getVectorFillLoopKey(face.pieceKeys)));
  const filledFaceKeys = node.filledFaceKeys.filter(
    (key) => !touchedLoopKeys.has(key) && key.split(',').every((pieceKey) => pieceKey.split('[')[0] in segments),
  );

  return { ...node, filledFaceKeys, segments, vertices };
};
