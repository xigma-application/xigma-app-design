// types
import { TLineNetworkCrossing, TVectorNetworkComponent } from '../types';

// utils
import { buildClosingSegments } from './buildClosingSegments';
import { collectClosingPairKeys } from './collectClosingPairKeys';
import { deriveClosedFaces } from './deriveClosedFaces';
import { getVectorFillLoopKey } from '../../getVectorFillLoopKey';
import { getVectorNetworkOpenEndpointIds } from '../getVectorNetworkOpenEndpointIds';

export const addCutClosingSegment = (
  component: TVectorNetworkComponent,
  vertexLineT: Record<string, number>,
  originalFilledFaceKeys: string[],
  crossings: TLineNetworkCrossing[],
): TVectorNetworkComponent => {
  const openEndIds = getVectorNetworkOpenEndpointIds(component.segments).filter((id) => id in vertexLineT);
  const closingPairKeys = collectClosingPairKeys(originalFilledFaceKeys, crossings, openEndIds, vertexLineT);

  if (closingPairKeys.size === 0) {
    return component;
  }

  const segments = { ...component.segments, ...buildClosingSegments(closingPairKeys) };
  const faces = deriveClosedFaces(segments, component);

  return { ...component, filledFaceKeys: faces.map((face) => getVectorFillLoopKey(face.pieceKeys)), segments };
};
