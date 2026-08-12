// mirrors the HTML overlay's `overflow-wrap: break-word` — normal word-wrap at spaces, but a run
// of characters with no space (or the very first word on a line) still breaks mid-word once it
// alone overflows maxWidth, instead of overflowing the box on one unbroken line
export const wrapText = (measureWidth: (text: string) => number, content: string, maxWidth: number): string[] => {
  const lines: string[] = [];

  content.split('\n').forEach((sourceLine) => {
    let currentLine = '';
    let lastSpaceIndex = -1;

    sourceLine.split('').forEach((char) => {
      const candidate = currentLine + char;

      if (currentLine && measureWidth(candidate) > maxWidth) {
        if (lastSpaceIndex >= 0) {
          lines.push(currentLine.slice(0, lastSpaceIndex));
          currentLine = currentLine.slice(lastSpaceIndex + 1) + char;
        } else {
          lines.push(currentLine);
          currentLine = char;
        }

        lastSpaceIndex = -1;
      } else {
        currentLine = candidate;
      }

      if (char === ' ') {
        lastSpaceIndex = currentLine.length - 1;
      }
    });

    lines.push(currentLine);
  });

  return lines;
};
