// types
import { TVectorSegment, TVectorTangent } from 'types/design/types';

const isZeroTangent = (tangent: TVectorTangent): boolean => !tangent || (tangent.x === 0 && tangent.y === 0);

export const isStraightVectorSegment = (segment: TVectorSegment): boolean =>
  isZeroTangent(segment.tangentStart) && isZeroTangent(segment.tangentEnd);
