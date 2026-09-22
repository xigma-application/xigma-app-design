// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode, TTextNode } from 'types/design/types';

// utils
import { canExportTextOnPathAsVectorCurves } from '../canExportTextOnPathAsVectorCurves';

const path: TSceneNode = {
  fill: '#000000',
  height: 10,
  id: 'p',
  name: 'p',
  parentId: null,
  rotation: 0,
  type: NodeType.path,
  width: 10,
  x: 0,
  y: 0,
} as never;

const text = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'abc',
  fill: '#000000',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 12,
  height: 10,
  id: 't',
  name: 't',
  parentId: null,
  pathId: 'p',
  rotation: 0,
  type: NodeType.text,
  width: 30,
  x: 10,
  y: 10,
  ...overrides,
});

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: ['t'],
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

const check = (node: TTextNode, ...ancestors: TSceneNode[]): boolean =>
  canExportTextOnPathAsVectorCurves(node, Object.fromEntries([path, ...ancestors].map((ancestor) => [ancestor.id, ancestor])));

describe('canExportTextOnPathAsVectorCurves', () => {
  it('should allow a plain unrotated text on a resolvable path', () => {
    expect(check(text())).toBe(true);
  });

  it('should reject text with no pathId, or a pathId that cannot be resolved', () => {
    expect(check(text({ pathId: null }))).toBe(false);
    expect(check(text({ pathId: 'missing' }))).toBe(false);
  });

  it('should reject flipped, rotated, hidden or blended text', () => {
    expect(check(text({ flipX: true }))).toBe(false);
    expect(check(text({ flipY: true }))).toBe(false);
    expect(check(text({ rotation: 10 }))).toBe(false);
    expect(check(text({ hidden: true }))).toBe(false);
    expect(check(text({ blendMode: BlendMode.multiply }))).toBe(false);
  });

  it('should allow translucent text (opacity is applied through the vector fill, not real PDF text)', () => {
    expect(check(text({ opacity: 0.5 }))).toBe(true);
  });

  it('should accept an explicit normal blend mode and full opacity', () => {
    expect(check(text({ blendMode: BlendMode.normal, opacity: 1 }))).toBe(true);
  });

  it('should reject stroked text', () => {
    expect(check(text({ strokeWidth: 2 }))).toBe(false);
  });

  it('should reject empty text', () => {
    expect(check(text({ content: '' }))).toBe(false);
  });

  it('should allow text inside a plain, translucent ancestor chain (unlike real text)', () => {
    expect(check(text({ parentId: 'f' }), frame())).toBe(true);
    expect(check(text({ parentId: 'f' }), frame({ opacity: 0.4 }))).toBe(true);
  });

  it('should allow a rotated ancestor but reject a hidden or blended one', () => {
    expect(check(text({ parentId: 'f' }), frame({ rotation: 5 }))).toBe(true);
    expect(check(text({ parentId: 'f' }), frame({ hidden: true }))).toBe(false);
    expect(check(text({ parentId: 'f' }), frame({ blendMode: BlendMode.screen }))).toBe(false);
  });

  it('should reject text that overflows a clipping frame but allow it in a non-clipping one', () => {
    expect(check(text({ parentId: 'f', x: 90 }), frame({ clipContent: true }))).toBe(false);
    expect(check(text({ parentId: 'f', x: 90 }), frame({ clipContent: false }))).toBe(true);
  });
});
