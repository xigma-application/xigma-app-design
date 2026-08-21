export type TEditableLine = { container: Node; nodes: Text[] };

const collectTextNodes = (node: Node): Text[] => {
  if (node.nodeType === Node.TEXT_NODE) {
    return [node as Text];
  }

  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let currentNode = walker.nextNode() as Text | null;

  while (currentNode) {
    textNodes.push(currentNode);
    currentNode = walker.nextNode() as Text | null;
  }

  return textNodes;
};

export const getEditableLines = (element: HTMLElement): TEditableLine[] => {
  const lines: TEditableLine[] = [];
  let currentLine: Text[] = [];
  let hasPendingLine = true;

  element.childNodes.forEach((node) => {
    if (node.nodeName === 'BR') {
      lines.push({ container: element, nodes: currentLine });
      currentLine = [];
      hasPendingLine = false;
    } else if (node.nodeName === 'DIV') {
      if (hasPendingLine) {
        lines.push({ container: element, nodes: currentLine });
        currentLine = [];
      }

      lines.push({ container: node, nodes: collectTextNodes(node) });
      hasPendingLine = false;
    } else {
      currentLine.push(...collectTextNodes(node));
      hasPendingLine = true;
    }
  });

  if (hasPendingLine) {
    lines.push({ container: element, nodes: currentLine });
  }

  return lines;
};
