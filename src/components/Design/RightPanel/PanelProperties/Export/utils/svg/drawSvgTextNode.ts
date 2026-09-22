// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { escapeSvgText } from './escapeSvgText';
import { formatSvgNumber } from './formatSvgNumber';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getStraightTextGlyphPlacements } from 'utils/canvas/text/fontOutline/getStraightTextGlyphPlacements';
import { getSvgRotateTransformValue } from './getSvgRotateTransformValue';
import { toSvgPagePoint } from './toSvgPagePoint';

export const drawSvgTextNode = (elements: string[], node: TTextNode, nodesById: Record<string, TSceneNode>, bounds: TDraftRect): void => {
  const glyphs = getStraightTextGlyphPlacements(MSDF_ATLAS_JSON, node)
    .map(({ baselineY, char, penX }) => {
      const point = toSvgPagePoint({ x: penX, y: baselineY }, bounds);
      return `<tspan x="${formatSvgNumber(point.x)}" y="${formatSvgNumber(point.y)}">${escapeSvgText(char)}</tspan>`;
    })
    .join('');

  if (glyphs) {
    const opacity = getEffectiveOpacity(node, nodesById);
    const opacityAttribute = opacity < 1 ? ` opacity="${formatSvgNumber(opacity)}"` : '';
    const rotationValue = getSvgRotateTransformValue(node.rotation, node, bounds);
    const transformAttribute = rotationValue ? ` transform="${rotationValue}"` : '';

    elements.push(
      `<text fill="${node.fill}" font-family="Inter, sans-serif" font-size="${formatSvgNumber(node.fontSize)}"${opacityAttribute}${transformAttribute}>${glyphs}</text>`,
    );
  }
};
