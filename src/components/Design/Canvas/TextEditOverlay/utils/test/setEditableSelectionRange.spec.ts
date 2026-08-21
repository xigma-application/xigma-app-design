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

    // before — index 2 into "first", index 9 (5 for "first" + 1 for the <br>'s own \n + 3 into "second")
    setEditableSelectionRange(element, 2, 9);

    // result
    const selection = window.getSelection();

    expect(selection?.anchorNode).toBe(firstLine);
    expect(selection?.anchorOffset).toBe(2);
    expect(selection?.focusNode).toBe(secondLine);
    expect(selection?.focusOffset).toBe(3);

    // after
    document.body.removeChild(element);
  });

  it('should land in the right <div>-wrapped line, matching how a real browser structures content typed with Enter (not the flat <br> seeding structure)', () => {
    // mock — "hi\nthere\nyou": a loose first line followed by two consecutive <div>-wrapped lines,
    // with no <br> between the divs — this is how Chrome's own contentEditable represents Enter
    // presses during live typing, as opposed to the flat text/<br>/text structure setEditableTextContent seeds
    const element = document.createElement('div');
    const firstLine = document.createTextNode('hi');
    const secondDiv = document.createElement('div');
    const secondLine = document.createTextNode('there');
    const thirdDiv = document.createElement('div');
    const thirdLine = document.createTextNode('you');

    secondDiv.appendChild(secondLine);
    thirdDiv.appendChild(thirdLine);
    element.appendChild(firstLine);
    element.appendChild(secondDiv);
    element.appendChild(thirdDiv);
    document.body.appendChild(element);

    // before — index 3 (start of "there"), index 9 (start of "you", across the second div boundary)
    setEditableSelectionRange(element, 3, 9);

    // result
    const selection = window.getSelection();

    expect(selection?.anchorNode).toBe(secondLine);
    expect(selection?.anchorOffset).toBe(0);
    expect(selection?.focusNode).toBe(thirdLine);
    expect(selection?.focusOffset).toBe(0);

    // after
    document.body.removeChild(element);
  });

  it('should collapse at the start of an empty <div><br></div> line', () => {
    // mock — "a\n\nb": an empty middle line represented the way Chrome collapses one, as a <div>
    // wrapping a lone <br> with no text node inside it at all
    const element = document.createElement('div');
    const firstLine = document.createTextNode('a');
    const emptyDiv = document.createElement('div');
    const thirdDiv = document.createElement('div');
    const thirdLine = document.createTextNode('b');

    emptyDiv.appendChild(document.createElement('br'));
    thirdDiv.appendChild(thirdLine);
    element.appendChild(firstLine);
    element.appendChild(emptyDiv);
    element.appendChild(thirdDiv);
    document.body.appendChild(element);

    // before — index 2 is the start of the empty line, between "a"'s newline and "b"'s newline
    setEditableSelectionRange(element, 2, 2);

    // result
    const selection = window.getSelection();

    expect(selection?.anchorNode).toBe(emptyDiv);
    expect(selection?.anchorOffset).toBe(0);

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
