// types
import { TVectorNode } from 'types/design/types';
import { TErasedNetwork } from '../types';

// utils
import { omitSegment } from './omitSegment';

export const eraseWholeSegment = (node: TVectorNode, segmentId: string): TErasedNetwork => ({
  segments: omitSegment(node.segments, segmentId),
  vertices: node.vertices,
});
