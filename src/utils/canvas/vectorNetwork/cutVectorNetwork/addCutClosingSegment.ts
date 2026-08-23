// others
import { nanoid } from '@reduxjs/toolkit';

// types
import { NodeType } from 'types/design/enums';
import { TLineNetworkCrossing, TVectorNetworkComponent } from './types';

// utils
import { deriveVectorFaces } from '../deriveVectorFaces';
import { getVectorFillLoopKey } from '../getVectorFillLoopKey';
import { getVectorNetworkOpenEndpointIds } from './getVectorNetworkOpenEndpointIds';

const getRealSegmentIdsForLoopKey = (loopKey: string): Set<string> => new Set(loopKey.split(',').map((pieceKey) => pieceKey.split('[')[0]));

export const addCutClosingSegment = (
  component: TVectorNetworkComponent,
  vertexLineT: Record<string, number>,
  originalFilledFaceKeys: string[],
  crossings: TLineNetworkCrossing[],
): TVectorNetworkComponent => {
  const openEndIds = getVectorNetworkOpenEndpointIds(component.segments).filter((id) => id in vertexLineT);
  const closingPairKeys = new Set<string>();

  originalFilledFaceKeys.forEach((loopKey) => {
    const realSegmentIds = getRealSegmentIdsForLoopKey(loopKey);
    const faceLineTs = new Set(crossings.filter((crossing) => realSegmentIds.has(crossing.segmentId)).map((crossing) => crossing.lineT));
    const faceOpenEndIds = openEndIds.filter((id) => faceLineTs.has(vertexLineT[id]));
    const canPair = faceOpenEndIds.length > 0 && faceOpenEndIds.length % 2 === 0;

    if (canPair) {
      const sortedFaceOpenEndIds = [...faceOpenEndIds].sort((a, b) => vertexLineT[a] - vertexLineT[b]);

      for (let i = 0; i < sortedFaceOpenEndIds.length; i += 2) {
        closingPairKeys.add([sortedFaceOpenEndIds[i], sortedFaceOpenEndIds[i + 1]].sort().join('|'));
      }
    }
  });

  if (closingPairKeys.size === 0) {
    return component;
  }

  const closingSegments: Record<string, TVectorNetworkComponent['segments'][string]> = {};

  closingPairKeys.forEach((pairKey) => {
    const [startId, endId] = pairKey.split('|');
    const closingSegmentId = nanoid();

    closingSegments[closingSegmentId] = { endId, id: closingSegmentId, startId, tangentEnd: null, tangentStart: null };
  });

  const segments = { ...component.segments, ...closingSegments };
  const faces = deriveVectorFaces({
    fillColor: null,
    filledFaceKeys: [],
    id: '__cut-fill-probe',
    name: '',
    parentId: null,
    rotation: 0,
    segments,
    strokeColor: '#000000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: component.vertexHandleModes,
    vertices: component.vertices,
  });

  return { ...component, filledFaceKeys: faces.map((face) => getVectorFillLoopKey(face.pieceKeys)), segments };
};
