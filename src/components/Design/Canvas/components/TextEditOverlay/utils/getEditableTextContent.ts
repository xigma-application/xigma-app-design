export const getEditableTextContent = (element: HTMLElement): string => {
  const lines: string[] = [];
  let currentLine = '';
  let hasPendingLine = true;

  element.childNodes.forEach((node) => {
    if (node.nodeName === 'BR') {
      lines.push(currentLine);
      currentLine = '';
      hasPendingLine = false;
    } else if (node.nodeName === 'DIV') {
      if (hasPendingLine) {
        lines.push(currentLine);
        currentLine = '';
      }

      lines.push(node.textContent as string);
      hasPendingLine = false;
    } else {
      currentLine += node.textContent as string;
      hasPendingLine = true;
    }
  });

  if (hasPendingLine) {
    lines.push(currentLine);
  }

  return lines.join('\n');
};
