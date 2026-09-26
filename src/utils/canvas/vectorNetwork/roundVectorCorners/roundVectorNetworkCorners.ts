// others
import { VECTOR_CORNER_SEGMENT_SUFFIX } from './constants';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorCornerArc } from './getVectorCornerArc';
import { getVectorRoundableCorner } from './getVectorRoundableCorner';
import { getVectorSegmentIdsByVertex } from './getVectorSegmentIdsByVertex';
import { getVectorVertexCornerRadius } from './getVectorVertexCornerRadius';
import { replaceVectorSegmentEnd } from './replaceVectorSegmentEnd';

export type TRoundedVectorNetwork = Pick<TVectorNode, 'segments' | 'vertices'>;

type TRoundedVectorSource = TRoundedVectorNetwork & Pick<TVectorNode, 'cornerRadius' | 'cornerRadiusByVertexId'>;

export const roundVectorNetworkCorners = (node: TRoundedVectorSource): TRoundedVectorNetwork | null => {
  const segmentIdsByVertex = getVectorSegmentIdsByVertex(node.segments);
  const segments = { ...node.segments };
  const vertices = { ...node.vertices };
  let isRounded = false;

  Object.values(node.vertices).forEach((vertex) => {
    const radius = getVectorVertexCornerRadius(node, vertex.id);
    const corner = radius > 0 ? getVectorRoundableCorner(node, vertex.id, segmentIdsByVertex.get(vertex.id) ?? []) : null;
    const arc = corner && getVectorCornerArc(vertex, corner.firstEnd, corner.secondEnd, radius);

    if (corner && arc) {
      const startId = `${vertex.id}~${corner.first.id}`;
      const endId = `${vertex.id}~${corner.second.id}`;
      const arcId = `${vertex.id}${VECTOR_CORNER_SEGMENT_SUFFIX}`;

      vertices[startId] = { id: startId, ...arc.start };
      vertices[endId] = { id: endId, ...arc.end };
      segments[corner.first.id] = replaceVectorSegmentEnd(segments[corner.first.id], vertex.id, startId);
      segments[corner.second.id] = replaceVectorSegmentEnd(segments[corner.second.id], vertex.id, endId);
      segments[arcId] = { endId, id: arcId, startId, tangentEnd: arc.tangentEnd, tangentStart: arc.tangentStart };
      delete vertices[vertex.id];
      isRounded = true;
    }
  });

  return isRounded ? { segments, vertices } : null;
};
