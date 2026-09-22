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

const check = (node: TTextNode, allowBlendMode: boolean, ...ancestors: TSceneNode[]): boolean =>
  canExportTextOnPathAsVectorCurves(
    node,
    Object.fromEntries([path, ...ancestors].map((ancestor) => [ancestor.id, ancestor])),
    allowBlendMode,
  );

describe('canExportTextOnPathAsVectorCurves', () => {
  it('should allow a plain unrotated text on a resolvable path', () => {
    expect(check(text(), false)).toBe(true);
  });

  it('should reject text with no pathId, or a pathId that cannot be resolved', () => {
    expect(check(text({ pathId: null }), false)).toBe(false);
    expect(check(text({ pathId: 'missing' }), false)).toBe(false);
  });

  it('should reject flipped, rotated, hidden or blended text', () => {
    expect(check(text({ flipX: true }), false)).toBe(false);
    expect(check(text({ flipY: true }), false)).toBe(false);
    expect(check(text({ rotation: 10 }), false)).toBe(false);
    expect(check(text({ hidden: true }), false)).toBe(false);
    expect(check(text({ blendMode: BlendMode.multiply }), false)).toBe(false);
  });

  it('should allow translucent text (opacity is applied through the vector fill, not real PDF text)', () => {
    expect(check(text({ opacity: 0.5 }), false)).toBe(true);
  });

  it('should accept an explicit normal blend mode and full opacity', () => {
    expect(check(text({ blendMode: BlendMode.normal, opacity: 1 }), false)).toBe(true);
  });

  it('should reject stroked text', () => {
    expect(check(text({ strokeWidth: 2 }), false)).toBe(false);
  });

  it('should reject empty text', () => {
    expect(check(text({ content: '' }), false)).toBe(false);
  });

  it('should allow text inside a plain, translucent ancestor chain (unlike real text)', () => {
    expect(check(text({ parentId: 'f' }), false, frame())).toBe(true);
    expect(check(text({ parentId: 'f' }), false, frame({ opacity: 0.4 }))).toBe(true);
  });

  it('should allow a rotated ancestor but reject a hidden one', () => {
    expect(check(text({ parentId: 'f' }), false, frame({ rotation: 5 }))).toBe(true);
    expect(check(text({ parentId: 'f' }), false, frame({ hidden: true }))).toBe(false);
  });

  it('should reject a blended ancestor when allowBlendMode is false but allow it when true', () => {
    expect(check(text({ parentId: 'f' }), false, frame({ blendMode: BlendMode.screen }))).toBe(false);
    expect(check(text({ parentId: 'f' }), true, frame({ blendMode: BlendMode.screen }))).toBe(true);
  });

  it('should reject text that overflows a clipping frame but allow it in a non-clipping one', () => {
    expect(check(text({ parentId: 'f', x: 90 }), false, frame({ clipContent: true }))).toBe(false);
    expect(check(text({ parentId: 'f', x: 90 }), false, frame({ clipContent: false }))).toBe(true);
  });
});
