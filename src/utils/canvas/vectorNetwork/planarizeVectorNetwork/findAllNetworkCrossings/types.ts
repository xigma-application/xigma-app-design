// types
import { TPoint } from 'types/canvas';
import { TSegmentCrossing } from '../types';
import { TVectorVertex } from 'types/design/types';

export type TNetworkCrossings = {
  crossingsBySegmentId: Map<string, TSegmentCrossing[]>;
  virtualVertices: Record<string, TVectorVertex>;
};

export type TBoundingBox = { maxX: number; maxY: number; minX: number; minY: number };

export type TCachedFlattenedSegment = { bbox: TBoundingBox; endVertex: TVectorVertex; points: TPoint[]; startVertex: TVectorVertex };

export type TIndexedBoundingBox = TBoundingBox & { index: number };
