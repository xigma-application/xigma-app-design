// types
import { TDistanceGuideLabel, TDistanceGuideLine } from '../getDistanceGuides/types';
import { TDraftRect, TPoint } from 'types/canvas';

export type TVectorDistanceAnchor = { kind: 'point'; point: TPoint } | { kind: 'box'; rect: TDraftRect };

export type TVectorDistanceTarget = { kind: 'vertex'; point: TPoint } | { kind: 'segment'; polyline: TPoint[] };

export type TVectorDistanceGuideParts = { labels: TDistanceGuideLabel[]; lines: TDistanceGuideLine[] };
