// types
import { TVectorNode } from 'types/design/types';
import { TErasedNetwork } from '../types';

// utils
import { findNewSegmentId } from './findNewSegmentId';
import { omitSegment } from './omitSegment';
import { severVectorSegmentAtPoint } from '../../cutVectorNetwork/severVectorSegmentAtPoint';

export const eraseSegmentMiddle = (node: TVectorNode, segmentId: string, tIn: number, tOut: number): TErasedNetwork => {
  const firstCut = severVectorSegmentAtPoint(node, segmentId, tIn, false);
  const farSegmentId = findNewSegmentId(node.segments, firstCut.segments);

  if (farSegmentId) {
    const reparameterisedTOut = (tOut - tIn) / (1 - tIn);
    const secondCut = severVectorSegmentAtPoint({ ...node, ...firstCut }, farSegmentId, reparameterisedTOut, false);

    return { segments: omitSegment(secondCut.segments, farSegmentId), vertices: secondCut.vertices };
  }

  return firstCut;
};
