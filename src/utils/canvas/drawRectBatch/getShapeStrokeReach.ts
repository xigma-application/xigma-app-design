// types
import { TBatchShape } from './types';

export const getShapeStrokeReach = (node: TBatchShape): number =>
  'strokes' in node && node.strokes && node.strokes.length > 0 && node.strokeWidth ? node.strokeWidth : 0;
