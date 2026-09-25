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

  it('should allow a line with a stroke colour and width, and a shape with a stroke colour and width', () => {
    // result
    expect(canOutlineNodeStroke(makeNode({ stroke: '#000000', strokeWidth: 2, type: NodeType.line }))).toBe(true);
    expect(canOutlineNodeStroke(makeNode({ strokeColor: '#000000', strokeWidth: 2, type: NodeType.ellipse }))).toBe(true);
  });

  it('should not allow a node without a stroke width or a stroke colour', () => {
    // result
    expect(canOutlineNodeStroke(makeNode({ stroke: '', strokeWidth: 2, type: NodeType.line }))).toBe(false);
    expect(canOutlineNodeStroke(makeNode({ strokeColor: '#000000', strokeWidth: 0, type: NodeType.ellipse }))).toBe(false);
    expect(canOutlineNodeStroke(makeNode({ strokeWidth: 2, type: NodeType.ellipse }))).toBe(false);
    expect(canOutlineNodeStroke(makeNode({ type: NodeType.group }))).toBe(false);
  });
});
