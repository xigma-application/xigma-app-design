// types
import { TAutoLayoutChildSize } from './getAutoLayoutChildPositions';

export const groupAutoLayoutChildrenIntoLines = (
  isHorizontal: boolean,
  itemSpacing: number,
  availablePrimary: number,
  children: TAutoLayoutChildSize[],
): TAutoLayoutChildSize[][] => {
  const lines: TAutoLayoutChildSize[][] = [];
  let currentLine: TAutoLayoutChildSize[] = [];
  let currentLineLength = 0;

  children.forEach((child) => {
    const size = isHorizontal ? child.width : child.height;
    const candidateLength = currentLine.length === 0 ? size : currentLineLength + itemSpacing + size;

    if (currentLine.length > 0 && candidateLength > availablePrimary) {
      lines.push(currentLine);
      currentLine = [child];
      currentLineLength = size;
    } else {
      currentLine.push(child);
      currentLineLength = candidateLength;
    }
  });

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
};
