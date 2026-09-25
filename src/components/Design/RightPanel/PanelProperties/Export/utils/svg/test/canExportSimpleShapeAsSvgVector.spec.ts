// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TFrameNode, TStarNode } from 'types/design/types';

// utils
import { canExportSimpleShapeAsSvgVector } from '../canExportSimpleShapeAsSvgVector';

const star = (overrides: Partial<TStarNode> = {}): TStarNode => ({
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 10,
  id: 'e',
  name: 'e',
  parentId: null,
  points: 5,
  ratio: 0.5,
  rotation: 0,
  type: NodeType.star,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const check = (node: TStarNode): boolean => canExportSimpleShapeAsSvgVector(node, {});

describe('canExportSimpleShapeAsSvgVector', () => {
  it('should allow a plain star', () => {
    expect(check(star())).toBe(true);
  });

  it('should reject a hidden or blended node', () => {
    expect(check(star({ hidden: true }))).toBe(false);
    expect(check(star({ blendMode: BlendMode.screen }))).toBe(false);
    expect(check(star({ blendMode: BlendMode.normal }))).toBe(true);
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

    expect(canExportSimpleShapeAsSvgVector(star({ parentId: 'p' }), { p: parent })).toBe(false);
  });
});
