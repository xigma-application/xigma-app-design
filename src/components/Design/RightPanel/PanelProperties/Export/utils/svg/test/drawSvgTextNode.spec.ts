// types
import { NodeType } from 'types/design/enums';
import { TTextNode } from 'types/design/types';

// utils
import { drawSvgTextNode } from '../drawSvgTextNode';

const node: TTextNode = {
  content: 'a&b',
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 20,
  height: 24,
  id: 't',
  name: 't',
  opacity: 0.5,
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 100,
  x: 50,
  y: 60,
};

describe('drawSvgTextNode', () => {
  it('should draw every glyph as a positioned, escaped tspan inside one <text> element in page coordinates', () => {
    // mock
    const elements: string[] = [];

    // action
    drawSvgTextNode(elements, node, { height: 200, width: 300, x: 10, y: 20 });

    // result
    expect(elements).toHaveLength(1);
    expect(elements[0]).toContain('<text fill="#ff0000" font-family="Inter, sans-serif" font-size="20" opacity="0.5">');
    expect(elements[0]).toContain('>a</tspan>');
    expect(elements[0]).toContain('>&amp;</tspan>');
    expect(elements[0]).toContain('>b</tspan>');
    expect(elements[0]).toMatch(/<tspan x="40" y="[\d.]+">/);

    const [, firstY] = elements[0].match(/<tspan x="40" y="([\d.]+)">/) ?? [];

    expect(Number(firstY)).toBeGreaterThan(0);
    expect(Number(firstY)).toBeLessThan(200);
  });

  it('should default to full opacity and omit the opacity attribute', () => {
    // mock
    const elements: string[] = [];

    // action
    drawSvgTextNode(elements, { ...node, opacity: undefined }, { height: 200, width: 300, x: 0, y: 0 });

    // result
    expect(elements[0]).toContain('<text fill="#ff0000" font-family="Inter, sans-serif" font-size="20">');
  });

  it('should draw nothing when every character is missing from the glyph atlas', () => {
    // mock
    const elements: string[] = [];

    // action
    drawSvgTextNode(elements, { ...node, content: '\u0001\u0002' }, { height: 200, width: 300, x: 0, y: 0 });

    // result
    expect(elements).toHaveLength(0);
  });
});
