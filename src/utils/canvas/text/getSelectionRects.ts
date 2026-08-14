// types
import { TDraftRect } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { findLineIndexForOffset } from './findLineIndexForOffset';
import { measureGlyphTextWidth } from './measureGlyphTextWidth';
import { wrapTextWithOffsets } from './wrapTextWithOffsets';

export const getSelectionRects = (
  atlas: TGlyphAtlasJson,
  content: string,
  width: number,
  fontSize: number,
  originX: number,
  originY: number,
  start: number,
  end: number,
): TDraftRect[] => {
  if (start === end) {
    return [];
  }

  const scale = fontSize / atlas.info.size;
  const lineHeight = atlas.common.lineHeight * scale;
  const measureWidth = (text: string): number => measureGlyphTextWidth(atlas, text, fontSize);
  const lines = wrapTextWithOffsets(measureWidth, content, width);
  const startLineIndex = findLineIndexForOffset(lines, start);
  const endLineIndex = findLineIndexForOffset(lines, end);

  return lines.slice(startLineIndex, endLineIndex + 1).map((line, index) => {
    const lineIndex = startLineIndex + index;
    const lineStartColumn = index === 0 ? Math.max(0, Math.min(start - line.startOffset, line.text.length)) : 0;
    const lineEndColumn = lineIndex === endLineIndex ? Math.max(0, Math.min(end - line.startOffset, line.text.length)) : line.text.length;

    return {
      height: lineHeight,
      width: measureWidth(line.text.slice(lineStartColumn, lineEndColumn)),
      x: originX + measureWidth(line.text.slice(0, lineStartColumn)),
      y: originY + lineIndex * lineHeight,
    };
  });
};
