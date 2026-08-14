export const insertTextAtCaret = (element: HTMLElement, text: string): void => {
  const selection = window.getSelection();

  if (selection?.rangeCount) {
    const range = selection.getRangeAt(0);

    if (element.contains(range.commonAncestorContainer)) {
      const textNode = document.createTextNode(text);

      range.deleteContents();
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
};
