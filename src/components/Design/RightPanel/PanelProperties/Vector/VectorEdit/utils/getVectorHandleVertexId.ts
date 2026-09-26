// types
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

export const getVectorHandleVertexId = (node: TVectorNode, { end, segmentId }: TVectorHandleHover): string =>
  end === 'start' ? node.segments[segmentId].startId : node.segments[segmentId].endId;
