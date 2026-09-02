// types
import { TPaint } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { buildVectorCutChordSegments } from './buildVectorCutChordSegments';
import { findLineNetworkCrossings } from '../findLineNetworkCrossings';
import { getEffectiveVectorFill } from '../../getEffectiveVectorFill';
import { getIsolatedVectorCutStubIds } from './getIsolatedVectorCutStubIds';
import { resolveVectorCutFilledFaceKeys } from './resolveVectorCutFilledFaceKeys';
import { severVectorCutCrossings } from './severVectorCutCrossings';

export const materializeVectorNetworkCut = (
  node: TVectorNode,
  lineStart: TPoint,
  lineEnd: TPoint,
): {
  fillByKey: Record<string, TPaint[]>;
  filledFaceKeys: string[];
  segments: Record<string, TVectorSegment>;
  vertices: Record<string, TVectorVertex>;
} | null => {
  const crossings = findLineNetworkCrossings(lineStart, lineEnd, node.segments, node.vertices);

  if (crossings.length !== 0) {
    const sortedCrossings = [...crossings].sort((a, b) => a.lineT - b.lineT);
    const lineDirection: TPoint = { x: lineEnd.x - lineStart.x, y: lineEnd.y - lineStart.y };
    const severed = severVectorCutCrossings(node.segments, node.vertices, sortedCrossings, lineDirection);
    const { chordSegments, chordedVertexIds } = buildVectorCutChordSegments(severed.sides, node);
    const isolatedStubIds = getIsolatedVectorCutStubIds(severed.sides, chordedVertexIds);
    const segments = { ...severed.segments, ...chordSegments };
    const resultNode = { ...node, segments, vertices: severed.vertices };
    const survivingFaces = resolveVectorCutFilledFaceKeys(resultNode, node, isolatedStubIds);
    const fillByKey = Object.fromEntries(survivingFaces.map(({ key, originalKey }) => [key, getEffectiveVectorFill(node, originalKey)]));

    return { fillByKey, filledFaceKeys: survivingFaces.map((face) => face.key), segments, vertices: severed.vertices };
  }

  return null;
};
