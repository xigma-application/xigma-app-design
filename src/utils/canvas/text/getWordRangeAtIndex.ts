const isWordChar = (char: string): boolean => /\S/.test(char);

export const getWordRangeAtIndex = (content: string, index: number): { start: number; end: number } => {
  if (content.length === 0) {
    return { end: 0, start: 0 };
  }

  const clampedIndex = Math.min(Math.max(index, 0), content.length);
  const referenceIndex = Math.min(clampedIndex, content.length - 1);
  const isReferenceWordChar = isWordChar(content[referenceIndex]);

  let start = clampedIndex;
  let end = clampedIndex;

  while (start > 0 && isWordChar(content[start - 1]) === isReferenceWordChar) {
    start--;
  }

  while (end < content.length && isWordChar(content[end]) === isReferenceWordChar) {
    end++;
  }

  return { end, start };
};
