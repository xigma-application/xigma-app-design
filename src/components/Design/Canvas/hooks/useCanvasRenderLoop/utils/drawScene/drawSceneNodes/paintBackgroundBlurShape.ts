// types
import { TMaskRenderer } from './types';
import { TSceneNode } from 'types/design/types';

export const paintBackgroundBlurShape = (renderer: TMaskRenderer, node: TSceneNode): void => {
  if ('fills' in node) {
    renderer.paintLeaf({ ...node, effects: undefined, fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }] }, 'fill');
  }
};
