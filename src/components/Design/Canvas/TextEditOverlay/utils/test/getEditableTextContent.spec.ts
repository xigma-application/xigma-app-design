// utils
import { getEditableTextContent } from '../getEditableTextContent';

const buildEditableElement = (html: string): HTMLDivElement => {
  const element = document.createElement('div');

  element.innerHTML = html;

  return element;
};

describe('getEditableTextContent', () => {
  it('should read plain text with no line breaks', () => {
    // mock
    const element = buildEditableElement('hello');

    // result
    expect(getEditableTextContent(element)).toBe('hello');
  });

  it('should read a single explicit line break as one newline', () => {
    // mock — chrome wraps the second line in its own <div> once there is real content on it
    const element = buildEditableElement('first<div>second</div>');

    // result
    expect(getEditableTextContent(element)).toBe('first\nsecond');
  });

  it('should read a plain top-level <br> as a line break (firefox/safari style, no wrapping <div>)', () => {
    // mock
    const element = buildEditableElement('first<br>second');

    // result
    expect(getEditableTextContent(element)).toBe('first\nsecond');
  });

  it('should read two consecutive top-level <br> tags as a blank line', () => {
    // mock
    const element = buildEditableElement('first<br><br>second');

    // result
    expect(getEditableTextContent(element)).toBe('first\n\nsecond');
  });

  it('should read a blank line (Enter twice) as exactly one empty line, not two', () => {
    // mock — chrome represents the blank line as a <div> containing only a <br>
    const element = buildEditableElement('first<div><br></div><div>second</div>');

    // result
    expect(getEditableTextContent(element)).toBe('first\n\nsecond');
  });

  it('should read two consecutive blank lines (Enter three times) correctly', () => {
    // mock
    const element = buildEditableElement('first<div><br></div><div><br></div><div>second</div>');

    // result
    expect(getEditableTextContent(element)).toBe('first\n\n\nsecond');
  });

  it('should return an empty string for an empty element', () => {
    // mock
    const element = buildEditableElement('');

    // result
    expect(getEditableTextContent(element)).toBe('');
  });
});
