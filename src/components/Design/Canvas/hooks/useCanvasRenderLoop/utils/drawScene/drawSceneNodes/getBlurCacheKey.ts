// types
import { TMaskRenderer } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { getDevicePixelHeight } from '../getDevicePixelHeight';
import { getDevicePixelWidth } from '../getDevicePixelWidth';

const toRelativeNode = (node: TSceneNode, origin: TSceneNode): TSceneNode =>
  'x' in node && 'x' in origin ? { ...node, x: node.x - origin.x, y: node.y - origin.y } : node;

export const getBlurCacheKey = (renderer: TMaskRenderer, node: TSceneNode, subtree: TSceneNode[]): string => {
  const { context, gl } = renderer;

  return JSON.stringify([
    [node, ...subtree].map((member) => toRelativeNode(member, node)),
    context.canvasWidth,
    getDevicePixelWidth(context, gl),
    getDevicePixelHeight(context, gl),
  ]);
};
