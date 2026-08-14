// types
import { TWrappedLine } from './wrapTextWithOffsets';

export const findLineIndexForOffset = (lines: TWrappedLine[], offset: number): number => {
  let lineIndex = 0;

  lines.forEach((line, index) => {
    if (line.startOffset <= offset) {
      lineIndex = index;
    }
  });

  return lineIndex;
};
