// types
import { TWrappedLine } from './wrapTextWithOffsets';

const breakLine = (
  currentLine: string,
  currentLineStart: number,
  lastSpaceIndex: number,
  lastSpaceOffset: number,
  globalOffset: number,
  char: string,
): { brokenLine: TWrappedLine; nextLine: string; nextLineStart: number } => {
  if (lastSpaceIndex >= 0) {
    return {
      brokenLine: { startOffset: currentLineStart, text: currentLine.slice(0, lastSpaceIndex) },
      nextLine: currentLine.slice(lastSpaceIndex + 1) + char,
      nextLineStart: lastSpaceOffset + 1,
    };
  }

  return {
    brokenLine: { startOffset: currentLineStart, text: currentLine },
    nextLine: char,
    nextLineStart: globalOffset,
  };
};

export const advanceLine = (
  lines: TWrappedLine[],
  currentLine: string,
  currentLineStart: number,
  lastSpaceIndex: number,
  lastSpaceOffset: number,
  globalOffset: number,
  candidate: string,
  char: string,
  exceedsMaxWidth: boolean,
): { currentLine: string; currentLineStart: number; lastSpaceIndex: number } => {
  if (exceedsMaxWidth) {
    const { brokenLine, nextLine, nextLineStart } = breakLine(
      currentLine,
      currentLineStart,
      lastSpaceIndex,
      lastSpaceOffset,
      globalOffset,
      char,
    );

    lines.push(brokenLine);

    return { currentLine: nextLine, currentLineStart: nextLineStart, lastSpaceIndex: -1 };
  }

  return { currentLine: candidate, currentLineStart, lastSpaceIndex };
};
