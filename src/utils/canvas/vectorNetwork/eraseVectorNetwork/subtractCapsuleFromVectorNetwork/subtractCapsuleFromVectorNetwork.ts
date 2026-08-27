// types
import { TErasedNetwork } from '../types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { buildCapsuleNetwork } from '../buildCapsuleNetwork/buildCapsuleNetwork';
import { deriveFilledFaceKeys } from './deriveFilledFaceKeys';
import { deriveVectorFaces } from '../../deriveVectorFaces/deriveVectorFaces';
import { filterKeptSegments } from './filterKeptSegments';
import { getOriginalFillPolygons } from './getOriginalFillPolygons';
import { getRemainingVertices } from '../../getRemainingVertices';
import { planarizeVectorNetwork } from '../../planarizeVectorNetwork/planarizeVectorNetwork';

export const subtractCapsuleFromVectorNetwork = (node: TVectorNode, path: TPoint[], radius: number): TErasedNetwork | null => {
  const capsule = buildCapsuleNetwork(path, radius);
  const capsuleSegmentIds = new Set(Object.keys(capsule.segments));
  const planar = planarizeVectorNetwork({ ...node.segments, ...capsule.segments }, { ...node.vertices, ...capsule.vertices });
  const originalFillPolygons = getOriginalFillPolygons(node);
  const { droppedOriginalPiece, keptCapsulePiece, keptSegments } = filterKeptSegments(
    planar,
    capsuleSegmentIds,
    capsule.polygon,
    originalFillPolygons,
  );

  if (!droppedOriginalPiece && !keptCapsulePiece) {
    return null;
  }

  const keptVertices = getRemainingVertices(planar.vertices, keptSegments);
  const newFaces = deriveVectorFaces({ ...node, segments: keptSegments, vertices: keptVertices });
  const survivingFaces = deriveFilledFaceKeys(newFaces, originalFillPolygons, capsuleSegmentIds);

  return {
    filledFaceKeys: survivingFaces.map((face) => face.key),
    segments: keptSegments,
    survivingFaces,
    vertices: keptVertices,
  };
};
