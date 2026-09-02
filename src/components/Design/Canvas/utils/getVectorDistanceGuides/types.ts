// types
import { TDistanceGuideLabel, TDistanceGuideLine } from '../getDistanceGuides/types';
import { TDraftRect, TPoint } from 'types/canvas';

export type TVectorDistanceAnchor = { kind: 'point'; point: TPoint } | { kind: 'box'; rect: TDraftRect };

export type TVectorDistanceGuideParts = { labels: TDistanceGuideLabel[]; lines: TDistanceGuideLine[] };
