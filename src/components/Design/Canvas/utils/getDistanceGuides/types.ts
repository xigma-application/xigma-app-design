// types
import { TPoint } from 'types/canvas';

export type TDistanceGuideLine = { dashed: boolean; x1: number; x2: number; y1: number; y2: number };

export type TDistanceGuideLabel = { anchor: TPoint; offsetDirection: TPoint; text: string };

export type TDistanceGuides = { labels: TDistanceGuideLabel[]; lines: TDistanceGuideLine[] };

export type TEdges = { bottom: number; left: number; right: number; top: number };
