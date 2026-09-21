import { PDFFont, PDFPage, rgb } from 'pdf-lib';

// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TDraftRect } from 'types/canvas';
import { TTextNode } from 'types/design/types';

// utils
import { getStraightTextGlyphPlacements } from 'utils/canvas/text/fontOutline/getStraightTextGlyphPlacements';
import { hexToRgbFloat } from 'utils/canvas/hexToRgbFloat';

export const drawPdfTextNode = (page: PDFPage, font: PDFFont, node: TTextNode, bounds: TDraftRect): void => {
  const [red, green, blue] = hexToRgbFloat(node.fill);
  const color = rgb(red, green, blue);
  const opacity = node.opacity ?? 1;

  getStraightTextGlyphPlacements(MSDF_ATLAS_JSON, node).forEach(({ baselineY, char, penX }) => {
    page.drawText(char, { color, font, opacity, size: node.fontSize, x: penX - bounds.x, y: bounds.height - (baselineY - bounds.y) });
  });
};
