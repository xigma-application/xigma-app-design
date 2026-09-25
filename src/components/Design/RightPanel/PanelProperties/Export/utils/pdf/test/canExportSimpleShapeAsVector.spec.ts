// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TFrameNode, TPolygonNode } from 'types/design/types';

// utils
import { canExportSimpleShapeAsVector } from '../canExportSimpleShapeAsVector';

const polygon = (overrides: Partial<TPolygonNode> = {}): TPolygonNode => ({
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 10,
  id: 'e',
  name: 'e',
  parentId: null,
  rotation: 0,
  sides: 5,
  type: NodeType.polygon,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const check = (node: TPolygonNode): boolean => canExportSimpleShapeAsVector(node, {});

describe('canExportSimpleShapeAsVector', () => {
  it('should allow a plain polygon', () => {
    expect(check(polygon())).toBe(true);
  });

  it('should reject a hidden or blended node', () => {
    expect(check(polygon({ hidden: true }))).toBe(false);
    expect(check(polygon({ blendMode: BlendMode.screen }))).toBe(false);
    expect(check(polygon({ blendMode: BlendMode.normal }))).toBe(true);
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

    expect(canExportSimpleShapeAsVector(polygon({ parentId: 'p' }), { p: parent })).toBe(false);
  });
});
