// types
import { NodeType } from 'types/design/enums';
import { TMaskRenderer } from './types';
import { TSceneNode } from 'types/design/types';
import { TSolidPaint } from 'types/design/paint/types';

const MASK_PAINT: TSolidPaint = { color: '#ffffff', opacity: 100, type: 'solid' };

export const paintBackgroundBlurShape = (renderer: TMaskRenderer, node: TSceneNode): void => {
  if (node.type === NodeType.vector) {
    const fillByKey = Object.fromEntries(node.filledFaceKeys.map((key) => [key, [MASK_PAINT]]));
    renderer.paintLeaf({ ...node, effects: undefined, fillByKey, strokes: [] }, 'fill');
  } else if ('fills' in node) {
    renderer.paintLeaf({ ...node, effects: undefined, fills: [MASK_PAINT] }, 'fill');
  }
};
