// types
import { TPoint } from 'types/canvas';
import { TVectorDistanceAnchorResult } from './types';

export const getAnchorReferencePoint = (anchor: TVectorDistanceAnchorResult): TPoint =>
  anchor.kind === 'point' ? anchor.point : { x: anchor.rect.x + anchor.rect.width / 2, y: anchor.rect.y + anchor.rect.height / 2 };
