const breakLine = (currentLine: string, lastSpaceIndex: number, char: string): { brokenLine: string; nextLine: string } => {
  if (lastSpaceIndex >= 0) {
    return { brokenLine: currentLine.slice(0, lastSpaceIndex), nextLine: currentLine.slice(lastSpaceIndex + 1) + char };
  }

  return { brokenLine: currentLine, nextLine: char };
};

const advanceLine = (
  lines: string[],
  currentLine: string,
  lastSpaceIndex: number,
  candidate: string,
  char: string,
  exceedsMaxWidth: boolean,
): { currentLine: string; lastSpaceIndex: number } => {
  if (exceedsMaxWidth) {
    const { brokenLine, nextLine } = breakLine(currentLine, lastSpaceIndex, char);
    lines.push(brokenLine);

    return { currentLine: nextLine, lastSpaceIndex: -1 };
  }

  return { currentLine: candidate, lastSpaceIndex };
};

const getLastSpaceIndex = (currentLine: string, char: string, lastSpaceIndex: number): number => {
  if (char === ' ') {
    return currentLine.length - 1;
  }

  return lastSpaceIndex;
};

const wrapLine = (measureWidth: (text: string) => number, sourceLine: string, maxWidth: number): string[] => {
  const lines: string[] = [];
  let currentLine = '';
  let lastSpaceIndex = -1;

  sourceLine.split('').forEach((char) => {
    const candidate = currentLine + char;
    const exceedsMaxWidth = Boolean(currentLine) && measureWidth(candidate) > maxWidth;

    ({ currentLine, lastSpaceIndex } = advanceLine(lines, currentLine, lastSpaceIndex, candidate, char, exceedsMaxWidth));
    lastSpaceIndex = getLastSpaceIndex(currentLine, char, lastSpaceIndex);
  });

  lines.push(currentLine);

  return lines;
};

export const wrapText = (measureWidth: (text: string) => number, content: string, maxWidth: number): string[] =>
  content.split('\n').flatMap((sourceLine) => wrapLine(measureWidth, sourceLine, maxWidth));
