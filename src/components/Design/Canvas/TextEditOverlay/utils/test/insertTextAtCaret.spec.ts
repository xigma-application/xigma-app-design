// utils
import { insertTextAtCaret } from '../insertTextAtCaret';

const placeCaret = (textNode: Text, offset: number): void => {
  const range = document.createRange();

  range.setStart(textNode, offset);
  range.setEnd(textNode, offset);

  const selection = window.getSelection();

  selection?.removeAllRanges();
  selection?.addRange(range);
};

describe('insertTextAtCaret', () => {
  it('should insert text at the caret position', () => {
    // mock
    const element = document.createElement('div');
    const textNode = document.createTextNode('ab');

    element.appendChild(textNode);
    document.body.appendChild(element);
    placeCaret(textNode, 1);

    // before
    insertTextAtCaret(element, 'X');

    // result
    expect(element.textContent).toBe('aXb');

    document.body.removeChild(element);
  });

  it('should collapse the caret right after the inserted text', () => {
    // mock
    const element = document.createElement('div');
    const textNode = document.createTextNode('ab');

    element.appendChild(textNode);
    document.body.appendChild(element);
    placeCaret(textNode, 1);

    // before
    insertTextAtCaret(element, 'X');

    // result
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);

    expect(range?.collapsed).toBe(true);
    expect(element.textContent?.slice(0, range?.startOffset)).toBe('aX');

    document.body.removeChild(element);
  });

  it('should replace the selected text when a range is selected', () => {
    // mock
    const element = document.createElement('div');
    const textNode = document.createTextNode('abc');

    element.appendChild(textNode);
    document.body.appendChild(element);

    const range = document.createRange();

    range.setStart(textNode, 1);
    range.setEnd(textNode, 2);

    const selection = window.getSelection();

    selection?.removeAllRanges();
    selection?.addRange(range);

    // before
    insertTextAtCaret(element, 'X');

    // result
    expect(element.textContent).toBe('aXc');

    document.body.removeChild(element);
  });

  it('should do nothing when there is no active selection range', () => {
    // mock
    const element = document.createElement('div');

    element.textContent = 'ab';
    window.getSelection()?.removeAllRanges();

    // before
    insertTextAtCaret(element, 'X');

    // result
    expect(element.textContent).toBe('ab');
  });

  it('should do nothing when the selection is outside the element', () => {
    // mock
    const element = document.createElement('div');
    const otherElement = document.createElement('div');
    const otherTextNode = document.createTextNode('zz');

    element.textContent = 'ab';
    otherElement.appendChild(otherTextNode);
    document.body.appendChild(element);
    document.body.appendChild(otherElement);
    placeCaret(otherTextNode, 1);

    // before
    insertTextAtCaret(element, 'X');

    // result
    expect(element.textContent).toBe('ab');

    document.body.removeChild(element);
    document.body.removeChild(otherElement);
  });
});
