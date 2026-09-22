// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TFrameNode, TMediaNode, TSceneNode } from 'types/design/types';

// utils
import { canExportMediaNodeAsSvgVector } from '../canExportMediaNodeAsSvgVector';

const media = (overrides: Partial<TMediaNode> = {}): TMediaNode => ({
  flipX: false,
  flipY: false,
  height: 20,
  id: 'm',
  name: 'm',
  parentId: null,
  rotation: 0,
  src: 's',
  type: NodeType.media,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: ['m'],
  clipContent: false,
  fills: [],
  height: 100,
  id: 'f',
  name: 'f',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const check = (node: TMediaNode, ...ancestors: TSceneNode[]): boolean =>
  canExportMediaNodeAsSvgVector(node, Object.fromEntries(ancestors.map((ancestor) => [ancestor.id, ancestor])));

describe('canExportMediaNodeAsSvgVector', () => {
  it('should allow a plain visible media node with a source', () => {
    expect(check(media())).toBe(true);
  });

  it('should reject a hidden node', () => {
    expect(check(media({ hidden: true }))).toBe(false);
  });

  it('should reject a node with no source (nothing picked yet)', () => {
    expect(check(media({ src: '' }))).toBe(false);
  });

  it('should reject a non-normal blend mode but allow an explicit normal one', () => {
    expect(check(media({ blendMode: BlendMode.multiply }))).toBe(false);
    expect(check(media({ blendMode: BlendMode.normal }))).toBe(true);
  });

  it('should allow a translucent ancestor (opacity is applied through getEffectiveOpacity) but reject a rotated one', () => {
    expect(check(media({ parentId: 'f' }), frame({ opacity: 0.5 }))).toBe(true);
    expect(check(media({ parentId: 'f' }), frame({ rotation: 5 }))).toBe(false);
    expect(check(media({ parentId: 'f' }), frame())).toBe(true);
  });
});
