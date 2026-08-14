// utils
import { setEditableSelectionRange } from '../setEditableSelectionRange';

describe('setEditableSelectionRange', () => {
  it('should collapse the selection at the given index within a single text node', () => {
    // mock
    const element = document.createElement('div');

    element.textContent = 'hello';
    document.body.appendChild(element);

    // before
    setEditableSelectionRange(element, 2, 2);

    // result
    const selection = window.getSelection();

    expect(selection?.isCollapsed).toBe(true);
    expect(selection?.anchorOffset).toBe(2);
    expect(selection?.focusOffset).toBe(2);

    // after
    document.body.removeChild(element);
  });

  it('should select a range spanning part of a single text node', () => {
    // mock
    const element = document.createElement('div');

    element.textContent = 'hello world';
    document.body.appendChild(element);

    // before
    setEditableSelectionRange(element, 2, 7);

    // result
    expect(window.getSelection()?.toString()).toBe('llo w');

    // after
    document.body.removeChild(element);
  });

  it('should select across a <br>-separated multi-line node, landing in the correct text node on each side', () => {
    // mock
    const element = document.createElement('div');
    const firstLine = document.createTextNode('first');
    const secondLine = document.createTextNode('second');

    element.appendChild(firstLine);
    element.appendChild(document.createElement('br'));
    element.appendChild(secondLine);
    document.body.appendChild(element);

    // before — index 2 into "first", index 8 (5 for "first" + 3 into "second")
    setEditableSelectionRange(element, 2, 8);

    // result
    const selection = window.getSelection();

    expect(selection?.anchorNode).toBe(firstLine);
    expect(selection?.anchorOffset).toBe(2);
    expect(selection?.focusNode).toBe(secondLine);
    expect(selection?.focusOffset).toBe(3);

    // after
    document.body.removeChild(element);
  });

  it('should clamp an index past the end of the content to the end of the last text node', () => {
    // mock
    const element = document.createElement('div');

    element.textContent = 'hi';
    document.body.appendChild(element);

    // before
    setEditableSelectionRange(element, 0, 999);

    // result
    const selection = window.getSelection();

    expect(selection?.toString()).toBe('hi');
    expect(selection?.focusOffset).toBe(2);

    // after
    document.body.removeChild(element);
  });

  it('should replace any previously existing selection', () => {
    // mock
    const element = document.createElement('div');

    element.textContent = 'replace me';
    document.body.appendChild(element);
    setEditableSelectionRange(element, 0, 7);

    // before
    setEditableSelectionRange(element, 8, 10);

    // result
    const selection = window.getSelection();

    expect(selection?.rangeCount).toBe(1);
    expect(selection?.toString()).toBe('me');

    // after
    document.body.removeChild(element);
  });
});
