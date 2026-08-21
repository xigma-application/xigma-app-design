// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

export type TPlanarVectorNetwork = {
  segments: Record<string, TVectorSegment>;
  vertices: Record<string, TVectorVertex>;
};

export type TSegmentCrossing = { t: number; vertexId: string };
