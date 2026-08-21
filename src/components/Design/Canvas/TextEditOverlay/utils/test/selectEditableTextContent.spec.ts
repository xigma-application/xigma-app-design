// utils
import { selectEditableTextContent } from '../selectEditableTextContent';

describe('selectEditableTextContent', () => {
  it('should select all text content of the element', () => {
    // mock
    const element = document.createElement('div');

    element.textContent = 'hello world';
    document.body.appendChild(element);

    // before
    selectEditableTextContent(element);

    // result
    const selection = window.getSelection();

    expect(selection?.toString()).toBe('hello world');
    expect(selection?.rangeCount).toBe(1);

    // after
    document.body.removeChild(element);
  });

  it('should replace any previous selection instead of extending it', () => {
    // mock
    const elementA = document.createElement('div');
    const elementB = document.createElement('div');

    elementA.textContent = 'first';
    elementB.textContent = 'second';
    document.body.appendChild(elementA);
    document.body.appendChild(elementB);

    // before
    selectEditableTextContent(elementA);

    // action
    selectEditableTextContent(elementB);

    // result
    expect(window.getSelection()?.toString()).toBe('second');

    // after
    document.body.removeChild(elementA);
    document.body.removeChild(elementB);
  });

  it('should do nothing when no selection API is available', () => {
    // mock
    const element = document.createElement('div');

    element.textContent = 'hello';

    const getSelectionSpy = vi.spyOn(window, 'getSelection').mockReturnValue(null);

    // result
    expect(() => selectEditableTextContent(element)).not.toThrow();

    // after
    getSelectionSpy.mockRestore();
  });
});
