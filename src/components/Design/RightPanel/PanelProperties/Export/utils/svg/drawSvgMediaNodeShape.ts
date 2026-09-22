// types
import { TDraftRect } from 'types/canvas';
import { TMediaNode, TSceneNode } from 'types/design/types';

// utils
import { formatSvgNumber } from './formatSvgNumber';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getSvgRotateTransformValue } from './getSvgRotateTransformValue';
import { loadSvgImageAsset } from './loadSvgImageAsset';
import { toSvgPagePoint } from './toSvgPagePoint';

export const drawSvgMediaNodeShape = async (
  elements: string[],
  node: TMediaNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): Promise<void> => {
  const asset = await loadSvgImageAsset(node.src, 0, node.flipX, node.flipY);

  if (asset) {
    const rect = { height: node.height, width: node.width, x: node.x, y: node.y };
    const point = toSvgPagePoint({ x: rect.x, y: rect.y }, bounds);
    const rotationValue = getSvgRotateTransformValue(node.rotation, rect, bounds);
    const transformAttribute = rotationValue ? ` transform="${rotationValue}"` : '';
    const opacity = getEffectiveOpacity(node, nodesById);
    const opacityAttribute = opacity < 1 ? ` opacity="${formatSvgNumber(opacity)}"` : '';

    elements.push(
      `<image href="${asset.dataUrl}" x="${formatSvgNumber(point.x)}" y="${formatSvgNumber(point.y)}" width="${formatSvgNumber(
        rect.width,
      )}" height="${formatSvgNumber(rect.height)}" preserveAspectRatio="none"${transformAttribute}${opacityAttribute}/>`,
    );
  }
};
