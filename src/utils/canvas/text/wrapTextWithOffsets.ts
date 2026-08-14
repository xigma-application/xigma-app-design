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

    let currentLine = '';
    let currentLineStart = globalOffset;
    let lastSpaceIndex = -1;
    let lastSpaceOffset = -1;

    sourceLine.split('').forEach((char) => {
      const candidate = currentLine + char;

      if (currentLine && measureWidth(candidate) > maxWidth) {
        if (lastSpaceIndex >= 0) {
          lines.push({ startOffset: currentLineStart, text: currentLine.slice(0, lastSpaceIndex) });
          currentLine = currentLine.slice(lastSpaceIndex + 1) + char;
          currentLineStart = lastSpaceOffset + 1;
        } else {
          lines.push({ startOffset: currentLineStart, text: currentLine });
          currentLine = char;
          currentLineStart = globalOffset;
        }

        lastSpaceIndex = -1;
      } else {
        currentLine = candidate;
      }

      if (char === ' ') {
        lastSpaceIndex = currentLine.length - 1;
        lastSpaceOffset = globalOffset;
      }

      globalOffset += 1;
    });

    lines.push({ startOffset: currentLineStart, text: currentLine });
  });

  return lines;
};
