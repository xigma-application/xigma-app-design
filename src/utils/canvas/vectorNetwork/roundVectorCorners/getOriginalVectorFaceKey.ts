// others
import { VECTOR_CORNER_SEGMENT_SUFFIX } from './constants';

export const getOriginalVectorFaceKey = (key: string): string =>
  key
    .split(',')
    .filter((segmentId) => !segmentId.endsWith(VECTOR_CORNER_SEGMENT_SUFFIX))
    .join(',');
