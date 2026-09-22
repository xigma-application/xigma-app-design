import { PDFFont, PDFPage, rgb } from 'pdf-lib';

// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getStraightTextGlyphPlacements } from 'utils/canvas/text/fontOutline/getStraightTextGlyphPlacements';
import { hexToRgbFloat } from 'utils/canvas/hexToRgbFloat';

export const drawPdfTextNode = (
  page: PDFPage,
  font: PDFFont,
  node: TTextNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): void => {
  const [red, green, blue] = hexToRgbFloat(node.fill);
  const color = rgb(red, green, blue);
  const opacity = getEffectiveOpacity(node, nodesById);

  getStraightTextGlyphPlacements(MSDF_ATLAS_JSON, node).forEach(({ baselineY, char, penX }) => {
    page.drawText(char, { color, font, opacity, size: node.fontSize, x: penX - bounds.x, y: bounds.height - (baselineY - bounds.y) });
  });
};
