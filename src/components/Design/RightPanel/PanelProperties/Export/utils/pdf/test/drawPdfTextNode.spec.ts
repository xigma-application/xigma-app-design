// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode, TTextNode } from 'types/design/types';

// utils
import { drawPdfTextNode } from '../drawPdfTextNode';

const node: TTextNode = {
  content: 'ab',
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

describe('drawPdfTextNode', () => {
  it('should draw every glyph as real text at its baseline in page coordinates', () => {
    // mock
    const drawText = vi.fn();
    const page = { drawText } as never;
    const font = { name: 'font' } as never;

    // action
    drawPdfTextNode(page, font, node, {}, { height: 200, width: 300, x: 10, y: 20 });

    // result
    expect(drawText).toHaveBeenCalledTimes(2);
    expect(drawText.mock.calls[0][0]).toBe('a');
    expect(drawText.mock.calls[0][1]).toMatchObject({ font, opacity: 0.5, size: 20, x: 40 });
    expect(drawText.mock.calls[0][1].color).toMatchObject({ blue: 0, green: 0, red: 1 });
    expect(drawText.mock.calls[0][1].y).toBeGreaterThan(0);
    expect(drawText.mock.calls[0][1].y).toBeLessThan(200);
    expect(drawText.mock.calls[1][0]).toBe('b');
    expect(drawText.mock.calls[1][1].x).toBeGreaterThan(40);
  });

  it('should default to full opacity', () => {
    // mock
    const drawText = vi.fn();

    // action
    drawPdfTextNode({ drawText } as never, {} as never, { ...node, opacity: undefined }, {}, { height: 200, width: 300, x: 0, y: 0 });

    // result
    expect(drawText.mock.calls[0][1].opacity).toBe(1);
  });

  it('should compose its own opacity with every ancestor frame opacity, not just its own', () => {
    // mock
    const drawText = vi.fn();
    const parent: TFrameNode = {
      childIds: ['t'],
      clipContent: false,
      fills: [],
      height: 100,
      id: 'parent',
      name: 'parent',
      opacity: 0.5,
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    };
    const nodesById: Record<string, TSceneNode> = { parent };

    // action
    drawPdfTextNode({ drawText } as never, {} as never, { ...node, opacity: 0.5, parentId: 'parent' }, nodesById, {
      height: 200,
      width: 300,
      x: 10,
      y: 20,
    });

    // result — 0.5 (own) * 0.5 (parent) = 0.25
    expect(drawText.mock.calls[0][1].opacity).toBe(0.25);
  });
});
