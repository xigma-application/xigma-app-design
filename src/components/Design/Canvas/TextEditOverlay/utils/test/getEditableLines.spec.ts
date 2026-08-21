// utils
import { getEditableLines } from '../getEditableLines';

describe('getEditableLines', () => {
  it('should return a single line for plain text with no line breaks', () => {
    // mock
    const element = document.createElement('div');
    const textNode = document.createTextNode('hello');

    element.appendChild(textNode);

    // result
    expect(getEditableLines(element)).toEqual([{ container: element, nodes: [textNode] }]);
  });

  it('should split into two lines on a top-level <br>', () => {
    // mock
    const element = document.createElement('div');
    const firstLine = document.createTextNode('first');
    const secondLine = document.createTextNode('second');

    element.appendChild(firstLine);
    element.appendChild(document.createElement('br'));
    element.appendChild(secondLine);

    // result
    expect(getEditableLines(element)).toEqual([
      { container: element, nodes: [firstLine] },
      { container: element, nodes: [secondLine] },
    ]);
  });

  it('should treat a <div> line as its own line, flushing any pending loose text first', () => {
    // mock — chrome wraps the second line in its own <div> once there is real content on it
    const element = document.createElement('div');
    const firstLine = document.createTextNode('first');
    const secondDiv = document.createElement('div');
    const secondLine = document.createTextNode('second');

    secondDiv.appendChild(secondLine);
    element.appendChild(firstLine);
    element.appendChild(secondDiv);

    // result
    expect(getEditableLines(element)).toEqual([
      { container: element, nodes: [firstLine] },
      { container: secondDiv, nodes: [secondLine] },
    ]);
  });

  it('should not flush an extra blank line between two consecutive <div> lines', () => {
    // mock — a second Enter press wraps the next line in its own <div> too, with no <br> in between
    const element = document.createElement('div');
    const firstLine = document.createTextNode('first');
    const secondDiv = document.createElement('div');
    const secondLine = document.createTextNode('second');
    const thirdDiv = document.createElement('div');
    const thirdLine = document.createTextNode('third');

    secondDiv.appendChild(secondLine);
    thirdDiv.appendChild(thirdLine);
    element.appendChild(firstLine);
    element.appendChild(secondDiv);
    element.appendChild(thirdDiv);

    // result
    expect(getEditableLines(element)).toEqual([
      { container: element, nodes: [firstLine] },
      { container: secondDiv, nodes: [secondLine] },
      { container: thirdDiv, nodes: [thirdLine] },
    ]);
  });

  it('should represent an empty <div><br></div> line as a line with no text nodes', () => {
    // mock — chrome collapses a blank line to a <div> containing only a <br>, no text node inside it
    const element = document.createElement('div');
    const firstLine = document.createTextNode('first');
    const emptyDiv = document.createElement('div');

    emptyDiv.appendChild(document.createElement('br'));
    element.appendChild(firstLine);
    element.appendChild(emptyDiv);

    // result
    expect(getEditableLines(element)).toEqual([
      { container: element, nodes: [firstLine] },
      { container: emptyDiv, nodes: [] },
    ]);
  });

  it('should flatten text nested inside a non-<div> wrapper element into the current line', () => {
    // mock — an inline wrapper (e.g. from a paste with formatting) around a text node
    const element = document.createElement('div');
    const span = document.createElement('span');
    const wrappedText = document.createTextNode('bold');

    span.appendChild(wrappedText);
    element.appendChild(span);

    // result
    expect(getEditableLines(element)).toEqual([{ container: element, nodes: [wrappedText] }]);
  });

  it('should return a single empty line for an empty element', () => {
    // mock
    const element = document.createElement('div');

    // result
    expect(getEditableLines(element)).toEqual([{ container: element, nodes: [] }]);
  });
});
