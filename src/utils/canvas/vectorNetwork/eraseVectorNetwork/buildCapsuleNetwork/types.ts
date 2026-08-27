// types
import { TPoint } from 'types/canvas';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

export type TCapsuleNetwork = {
  polygon: TPoint[];
  segments: Record<string, TVectorSegment>;
  vertices: Record<string, TVectorVertex>;
};
