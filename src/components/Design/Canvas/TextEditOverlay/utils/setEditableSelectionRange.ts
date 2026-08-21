// utils
import { getEditableLines, TEditableLine } from './getEditableLines';

const getPositionInLine = (line: TEditableLine, offset: number): { node: Node; offset: number } => {
  let node: Node = line.container;
  let resultOffset = 0;
  let remaining = offset;

  for (const textNode of line.nodes) {
    const length = textNode.data.length;

    node = textNode;
    resultOffset = Math.min(remaining, length);

    if (remaining <= length) {
      break;
    }

    remaining -= length;
  }

  return { node, offset: resultOffset };
};

const getPositionForCharacterIndex = (element: HTMLElement, index: number): { node: Node; offset: number } => {
  const lines = getEditableLines(element);
  const lastLineIndex = lines.length - 1;
  let remaining = index;

  for (let lineIndex = 0; lineIndex < lastLineIndex; lineIndex += 1) {
    const line = lines[lineIndex];
    const lineLength = line.nodes.reduce((sum, textNode) => sum + textNode.data.length, 0);

    if (remaining <= lineLength) {
      return getPositionInLine(line, remaining);
    }

    remaining -= lineLength + 1; // +1 for the newline separating this line from the next
  }

  return getPositionInLine(lines[lastLineIndex], remaining);
};

export const setEditableSelectionRange = (element: HTMLElement, start: number, end: number): void => {
  const startPosition = getPositionForCharacterIndex(element, start);
  const endPosition = getPositionForCharacterIndex(element, end);
  const range = document.createRange();

  range.setStart(startPosition.node, startPosition.offset);
  range.setEnd(endPosition.node, endPosition.offset);

  const selection = window.getSelection();

  selection?.removeAllRanges();
  selection?.addRange(range);
};
