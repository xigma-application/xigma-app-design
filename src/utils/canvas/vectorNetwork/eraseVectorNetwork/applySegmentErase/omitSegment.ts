// types
import { TVectorSegment } from 'types/design/types';

export const omitSegment = (segments: Record<string, TVectorSegment>, segmentId: string): Record<string, TVectorSegment> =>
  Object.fromEntries(Object.entries(segments).filter(([id]) => id !== segmentId));
