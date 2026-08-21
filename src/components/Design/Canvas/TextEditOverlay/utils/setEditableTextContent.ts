export const setEditableTextContent = (element: HTMLElement, content: string): void => {
  element.textContent = '';

  content.split('\n').forEach((line, index) => {
    if (index > 0) {
      element.appendChild(document.createElement('br'));
    }

    element.appendChild(document.createTextNode(line));
  });
};
