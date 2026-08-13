export const selectEditableTextContent = (element: HTMLElement): void => {
  const selection = window.getSelection();

  if (selection) {
    const range = document.createRange();

    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};
