// types
import { TPoint } from 'types/canvas';
import { TVectorSegment, TVectorTangent } from 'types/design/types';

export type TVectorRoundableCorner = { first: TVectorSegment; firstEnd: TPoint; second: TVectorSegment; secondEnd: TPoint };

export type TVectorCornerArc = { end: TPoint; start: TPoint; tangentEnd: TVectorTangent; tangentStart: TVectorTangent };
