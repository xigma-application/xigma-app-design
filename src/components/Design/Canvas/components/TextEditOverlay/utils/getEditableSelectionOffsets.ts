// types
import { TTextEditSelection } from 'store/design/types';

// utils
import { getEditableTextContent } from './getEditableTextContent';

const getOffsetForBoundary = (element: HTMLElement, boundaryNode: Node, boundaryOffset: number): number => {
  const range = document.createRange();

  range.setStart(element, 0);
  range.setEnd(boundaryNode, boundaryOffset);

  const container = document.createElement('div');

  container.appendChild(range.cloneContents());

  return getEditableTextContent(container).length;
};

export const getEditableSelectionOffsets = (element: HTMLElement): TTextEditSelection => {
  const selection = window.getSelection();

  if (!selection?.anchorNode || !selection.focusNode) {
    return { end: 0, start: 0 };
  }

  if (!element.contains(selection.anchorNode) || !element.contains(selection.focusNode)) {
    return { end: 0, start: 0 };
  }

  const anchorOffset = getOffsetForBoundary(element, selection.anchorNode, selection.anchorOffset);
  const focusOffset = getOffsetForBoundary(element, selection.focusNode, selection.focusOffset);

  return { end: Math.max(anchorOffset, focusOffset), start: Math.min(anchorOffset, focusOffset) };
};
