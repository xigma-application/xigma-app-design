const getPositionForCharacterIndex = (element: HTMLElement, index: number): { node: Node; offset: number } => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node: Node = element;
  let offset = 0;
  let remaining = index;
  let currentNode = walker.nextNode() as Text | null;

  while (currentNode) {
    const length = currentNode.data.length;

    node = currentNode;
    offset = Math.min(remaining, length);

    if (remaining <= length) {
      break;
    }

    remaining -= length;
    currentNode = walker.nextNode() as Text | null;
  }

  return { node, offset };
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
