// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TPoint } from 'types/canvas';
import { TTextNode } from 'types/design/types';

// utils
import { getTextLineWidths } from 'utils/canvas/text/getTextLineWidths';

export const isPointInText = (point: TPoint, node: TTextNode): boolean => {
  const lineWidths = getTextLineWidths(MSDF_ATLAS_JSON, node.content, node.width, node.fontSize);
  const scale = node.fontSize / MSDF_ATLAS_JSON.info.size;
  const lineHeight = MSDF_ATLAS_JSON.common.lineHeight * scale;

  return lineWidths.some((width, index) => {
    const top = node.y + index * lineHeight;
    const bottom = node.y + (index + 1) * lineHeight;

    return width > 0 && point.x >= node.x && point.x <= node.x + width && point.y >= top && point.y <= bottom;
  });
};
