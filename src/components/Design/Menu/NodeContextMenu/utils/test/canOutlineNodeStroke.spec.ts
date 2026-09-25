// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { canOutlineNodeStroke } from '../canOutlineNodeStroke';

const makeNode = (overrides: Record<string, unknown>): TSceneNode =>
  ({ id: 'node', name: 'node', parentId: null, ...overrides }) as TSceneNode;

describe('canOutlineNodeStroke', () => {
  it('should always allow text', () => {
    // result
    expect(canOutlineNodeStroke(makeNode({ type: NodeType.text }))).toBe(true);
  });

  it('should allow a line with strokes and a width, and a shape with a stroke colour and width', () => {
    // result
    expect(
      canOutlineNodeStroke(makeNode({ strokeWidth: 2, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }], type: NodeType.line })),
    ).toBe(true);
    expect(canOutlineNodeStroke(makeNode({ strokeColor: '#000000', strokeWidth: 2, type: NodeType.ellipse }))).toBe(true);
  });

  it('should not allow a node without a stroke width, strokes or a stroke colour', () => {
    // result
    expect(canOutlineNodeStroke(makeNode({ strokeWidth: 2, strokes: [], type: NodeType.line }))).toBe(false);
    expect(canOutlineNodeStroke(makeNode({ strokeColor: '#000000', strokeWidth: 0, type: NodeType.ellipse }))).toBe(false);
    expect(canOutlineNodeStroke(makeNode({ strokeWidth: 2, type: NodeType.ellipse }))).toBe(false);
    expect(canOutlineNodeStroke(makeNode({ type: NodeType.group }))).toBe(false);
  });
});
