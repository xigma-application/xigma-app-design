// types
import { TDistanceGuideLabel, TDistanceGuideLine } from '../getDistanceGuides/types';
import { TPoint } from 'types/canvas';

export type TVectorDistanceAnchor = { point: TPoint };

export type TVectorDistanceTarget = { kind: 'vertex'; point: TPoint } | { kind: 'segment'; polyline: TPoint[] };

export type TVectorDistanceGuideParts = { labels: TDistanceGuideLabel[]; lines: TDistanceGuideLine[] };
