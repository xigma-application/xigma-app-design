// utils
import { getEditableSelectionOffsets } from '../getEditableSelectionOffsets';

const selectRange = (startNode: Node, startOffset: number, endNode: Node, endOffset: number): void => {
  const range = document.createRange();

  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  const selection = window.getSelection();

  selection?.removeAllRanges();
  selection?.addRange(range);
};

describe('getEditableSelectionOffsets', () => {
  it('should return zero offsets when there is no selection at all', () => {
    // mock
    const element = document.createElement('div');

    element.appendChild(document.createTextNode('hello'));
    vi.spyOn(window, 'getSelection').mockReturnValue(null);

    // result
    expect(getEditableSelectionOffsets(element)).toEqual({ end: 0, start: 0 });

    // after
    vi.restoreAllMocks();
  });

  it('should return zero offsets when the selection lives outside the given element', () => {
    // mock
    const element = document.createElement('div');
    const other = document.createElement('div');
    const otherText = document.createTextNode('elsewhere');

    other.appendChild(otherText);
    document.body.appendChild(other);
    selectRange(otherText, 1, otherText, 3);

    // result
    expect(getEditableSelectionOffsets(element)).toEqual({ end: 0, start: 0 });

    // after
    document.body.removeChild(other);
  });

  it('should compute matching start/end offsets for a forward selection', () => {
    // mock
    const element = document.createElement('div');
    const textNode = document.createTextNode('hello');

    element.appendChild(textNode);
    document.body.appendChild(element);
    selectRange(textNode, 1, textNode, 3);

    // result
    expect(getEditableSelectionOffsets(element)).toEqual({ end: 3, start: 1 });

    // after
    document.body.removeChild(element);
  });

  it('should sort a backward-dragged selection so start is still less than or equal to end', () => {
    // mock
    const element = document.createElement('div');
    const textNode = document.createTextNode('hello');

    element.appendChild(textNode);
    document.body.appendChild(element);

    const range = document.createRange();

    range.setStart(textNode, 1);
    range.setEnd(textNode, 3);

    const selection = window.getSelection();

    selection?.removeAllRanges();
    selection?.addRange(range);
    selection?.collapseToEnd();
    selection?.extend(textNode, 1);

    // result
    expect(getEditableSelectionOffsets(element)).toEqual({ end: 3, start: 1 });

    // after
    document.body.removeChild(element);
  });

  it('should count a <br> as one consumed character, matching getEditableTextContent', () => {
    // mock
    const element = document.createElement('div');
    const secondLine = document.createTextNode('cd');

    element.appendChild(document.createTextNode('ab'));
    element.appendChild(document.createElement('br'));
    element.appendChild(secondLine);
    document.body.appendChild(element);
    selectRange(secondLine, 1, secondLine, 1);

    // result — "ab" (2) + "\n" (1) + "c" (1) = offset 4
    expect(getEditableSelectionOffsets(element)).toEqual({ end: 4, start: 4 });

    // after
    document.body.removeChild(element);
  });
});
