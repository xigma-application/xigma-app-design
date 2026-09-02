// types
import { TGuideAxis, TGuideLine } from 'types/design/guides/types';
import { TFrameNode } from 'types/design/types';

export const getFrameGuideSpan = (frame: TFrameNode, axis: TGuideAxis): NonNullable<TGuideLine['span']> =>
  axis === 'x' ? { from: frame.y, to: frame.y + frame.height } : { from: frame.x, to: frame.x + frame.width };
