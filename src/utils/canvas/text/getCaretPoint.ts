// types
import { TGlyphAtlasJson } from 'types/msdf';
import { TPoint } from 'types/canvas';

// utils
import { findLineIndexForOffset } from './findLineIndexForOffset';
import { measureGlyphTextWidth } from './measureGlyphTextWidth';
import { wrapTextWithOffsets } from './wrapTextWithOffsets/wrapTextWithOffsets';

export const getCaretPoint = (
  atlas: TGlyphAtlasJson,
  content: string,
  width: number,
  fontSize: number,
  originX: number,
  originY: number,
  offset: number,
): TPoint => {
  const scale = fontSize / atlas.info.size;
  const lineHeight = atlas.common.lineHeight * scale;
  const lines = wrapTextWithOffsets((text) => measureGlyphTextWidth(atlas, text, fontSize), content, width);
  const lineIndex = findLineIndexForOffset(lines, offset);
  const line = lines[lineIndex];
  const column = Math.max(0, Math.min(offset - line.startOffset, line.text.length));

  return {
    x: originX + measureGlyphTextWidth(atlas, line.text.slice(0, column), fontSize),
    y: originY + lineIndex * lineHeight,
  };
};
