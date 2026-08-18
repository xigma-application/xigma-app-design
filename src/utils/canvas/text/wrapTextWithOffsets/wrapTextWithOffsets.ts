// utils
import { wrapLine } from './wrapLine';

export type TWrappedLine = {
  startOffset: number;
  text: string;
};

export const wrapTextWithOffsets = (measureWidth: (text: string) => number, content: string, maxWidth: number): TWrappedLine[] => {
  const lines: TWrappedLine[] = [];
  let globalOffset = 0;

  content.split('\n').forEach((sourceLine, sourceLineIndex) => {
    if (sourceLineIndex > 0) {
      globalOffset += 1;
    }

    const wrapped = wrapLine(measureWidth, sourceLine, maxWidth, globalOffset);

    lines.push(...wrapped.lines);
    globalOffset = wrapped.endOffset;
  });

  return lines;
};
