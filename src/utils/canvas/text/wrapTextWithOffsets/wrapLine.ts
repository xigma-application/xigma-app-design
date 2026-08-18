// types
import { TWrappedLine } from './wrapTextWithOffsets';

// utils
import { advanceLine } from './advanceLine';

const getLastSpaceIndex = (currentLine: string, char: string, lastSpaceIndex: number): number => {
  if (char === ' ') {
    return currentLine.length - 1;
  }

  return lastSpaceIndex;
};

const getLastSpaceOffset = (char: string, globalOffset: number, lastSpaceOffset: number): number => {
  if (char === ' ') {
    return globalOffset;
  }

  return lastSpaceOffset;
};

export const wrapLine = (
  measureWidth: (text: string) => number,
  sourceLine: string,
  maxWidth: number,
  startOffset: number,
): { endOffset: number; lines: TWrappedLine[] } => {
  const lines: TWrappedLine[] = [];
  let currentLine = '';
  let currentLineStart = startOffset;
  let lastSpaceIndex = -1;
  let lastSpaceOffset = -1;
  let globalOffset = startOffset;

  sourceLine.split('').forEach((char) => {
    const candidate = currentLine + char;
    const exceedsMaxWidth = Boolean(currentLine) && measureWidth(candidate) > maxWidth;

    ({ currentLine, currentLineStart, lastSpaceIndex } = advanceLine(
      lines,
      currentLine,
      currentLineStart,
      lastSpaceIndex,
      lastSpaceOffset,
      globalOffset,
      candidate,
      char,
      exceedsMaxWidth,
    ));
    lastSpaceIndex = getLastSpaceIndex(currentLine, char, lastSpaceIndex);
    lastSpaceOffset = getLastSpaceOffset(char, globalOffset, lastSpaceOffset);
    globalOffset += 1;
  });

  lines.push({ startOffset: currentLineStart, text: currentLine });

  return { endOffset: globalOffset, lines };
};
