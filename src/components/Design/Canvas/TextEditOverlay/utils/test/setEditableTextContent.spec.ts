// utils
import { getEditableTextContent } from '../getEditableTextContent';
import { setEditableTextContent } from '../setEditableTextContent';

describe('setEditableTextContent', () => {
  it('should set plain text with no line breaks as a single text node', () => {
    // mock
    const element = document.createElement('div');

    // before
    setEditableTextContent(element, 'hello');

    // result
    expect(element.childNodes).toHaveLength(1);
    expect(element.textContent).toBe('hello');
  });

  it('should separate lines with <br> elements, not <div> wrapping', () => {
    // mock
    const element = document.createElement('div');

    // before
    setEditableTextContent(element, 'first\nsecond');

    // result
    expect(Array.from(element.childNodes).map((node) => node.nodeName)).toEqual(['#text', 'BR', '#text']);
  });

  it('should clear any previous content before setting the new content', () => {
    // mock
    const element = document.createElement('div');

    element.innerHTML = 'stale content';

    // before
    setEditableTextContent(element, 'fresh');

    // result
    expect(element.textContent).toBe('fresh');
  });

  it('should round-trip through getEditableTextContent for multi-line content, including a blank line', () => {
    // mock
    const element = document.createElement('div');
    const content = 'first\n\nsecond';

    // before
    setEditableTextContent(element, content);

    // result
    expect(getEditableTextContent(element)).toBe(content);
  });

  it('should round-trip an empty string', () => {
    // mock
    const element = document.createElement('div');

    // before
    setEditableTextContent(element, '');

    // result
    expect(getEditableTextContent(element)).toBe('');
  });
});
