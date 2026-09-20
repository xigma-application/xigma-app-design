// types
import { TPaint } from 'types/design/paint/types';
import { TSceneNode } from 'types/design/types';

const isStaticPaint = (paint: TPaint): boolean => paint.type === 'solid' || paint.type.startsWith('gradient');

export const isBlurCacheable = (node: TSceneNode): boolean => {
  const fills = 'fills' in node ? node.fills : [];
  const strokes = 'strokes' in node ? (node.strokes ?? []) : [];

  return fills.every(isStaticPaint) && strokes.every(isStaticPaint);
};
