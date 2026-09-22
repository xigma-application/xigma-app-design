// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TEllipseNode, TFrameNode } from 'types/design/types';

// utils
import { canExportSimpleShapeAsVector } from '../canExportSimpleShapeAsVector';

const ellipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fill: '#ff0000',
  height: 10,
  id: 'e',
  name: 'e',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const check = (node: TEllipseNode): boolean => canExportSimpleShapeAsVector(node, {});

describe('canExportSimpleShapeAsVector', () => {
  it('should allow a plain ellipse', () => {
    expect(check(ellipse())).toBe(true);
  });

  it('should reject a hidden or blended node', () => {
    expect(check(ellipse({ hidden: true }))).toBe(false);
    expect(check(ellipse({ blendMode: BlendMode.screen }))).toBe(false);
    expect(check(ellipse({ blendMode: BlendMode.normal }))).toBe(true);
  });

  it('should reject a node whose ancestor is unsafe', () => {
    const parent: TFrameNode = {
      childIds: ['e'],
      clipContent: true,
      fills: [],
      height: 5,
      id: 'p',
      name: 'p',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 5,
      x: 0,
      y: 0,
    };

    expect(canExportSimpleShapeAsVector(ellipse({ parentId: 'p' }), { p: parent })).toBe(false);
  });
});
