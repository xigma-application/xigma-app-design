// types
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { flipTextPoint } from './flipTextPoint';
import { measureGlyphTextWidth } from './measureGlyphTextWidth';
import { rotatePoint } from 'utils/math/rotatePoint';
import { wrapTextWithOffsets } from './wrapTextWithOffsets/wrapTextWithOffsets';

export type TStraightCaretHit = {
  distance: number;
  index: number;
};

export const getStraightCaretIndexAtPoint = (
  atlas: TGlyphAtlasJson,
  content: string,
  fontSize: number,
  box: TEditingTextBox,
  point: TPoint,
): TStraightCaretHit => {
  const center: TPoint = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const unrotated = rotatePoint(point, center, -box.rotation);
  const local = flipTextPoint(unrotated, box);
  const scale = fontSize / atlas.info.size;
  const lineHeight = atlas.common.lineHeight * scale;
  const measureWidth = (text: string): number => measureGlyphTextWidth(atlas, text, fontSize);
  const lines = wrapTextWithOffsets(measureWidth, content, box.width);

  const localX = local.x - box.x;
  const localY = local.y - box.y;
  const rawLineIndex = Math.floor(localY / lineHeight);
  const lineIndex = Math.min(Math.max(rawLineIndex, 0), lines.length - 1);
  const line = lines[lineIndex];

  let bestColumn = 0;
  let bestColumnDistance = Infinity;

  Array.from({ length: line.text.length + 1 }, (_, column) => column).forEach((column) => {
    const columnDistance = Math.abs(measureWidth(line.text.slice(0, column)) - localX);

    if (columnDistance < bestColumnDistance) {
      bestColumnDistance = columnDistance;
      bestColumn = column;
    }
  });

  const clampedX = Math.min(Math.max(localX, 0), box.width);
  const clampedY = Math.min(Math.max(localY, 0), box.height);

  return {
    distance: Math.hypot(localX - clampedX, localY - clampedY),
    index: line.startOffset + bestColumn,
  };
};
