// types
import { TVectorNode } from 'types/design/types';
import { TErasedNetwork } from '../types';

// utils
import { omitSegment } from './omitSegment';
import { severVectorSegmentAtPoint } from '../../cutVectorNetwork/severVectorSegmentAtPoint';

export const eraseSegmentStart = (node: TVectorNode, segmentId: string, tOut: number): TErasedNetwork => {
  const severed = severVectorSegmentAtPoint(node, segmentId, tOut, false);
  return { segments: omitSegment(severed.segments, segmentId), vertices: severed.vertices };
};
