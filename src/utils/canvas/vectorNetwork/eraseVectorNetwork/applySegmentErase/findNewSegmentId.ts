// types
import { TVectorSegment } from 'types/design/types';

export const findNewSegmentId = (before: Record<string, TVectorSegment>, after: Record<string, TVectorSegment>): string | undefined =>
  Object.keys(after).find((id) => !(id in before));
