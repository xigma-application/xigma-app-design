// types
import { TVectorNode } from 'types/design/types';
import { TErasedNetwork } from '../types';

// utils
import { findNewSegmentId } from './findNewSegmentId';
import { omitSegment } from './omitSegment';
import { severVectorSegmentAtPoint } from '../../cutVectorNetwork/severVectorSegmentAtPoint';

export const eraseSegmentEnd = (node: TVectorNode, segmentId: string, tIn: number): TErasedNetwork => {
  const severed = severVectorSegmentAtPoint(node, segmentId, tIn);
  const droppedId = findNewSegmentId(node.segments, severed.segments);

  if (droppedId) {
    return { segments: omitSegment(severed.segments, droppedId), vertices: severed.vertices };
  }

  return severed;
};
