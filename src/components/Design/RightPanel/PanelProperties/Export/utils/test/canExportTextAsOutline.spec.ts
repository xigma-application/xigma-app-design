// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode, TTextNode } from 'types/design/types';

// utils
import { canExportTextAsOutline } from '../canExportTextAsOutline';

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
  canExportTextAsOutline(node, Object.fromEntries(ancestors.map((ancestor) => [ancestor.id, ancestor])), allowBlendMode);

describe('canExportTextAsOutline', () => {
  it('should allow plain unrotated text, with no pathId required (unlike the on-path curves tier)', () => {
    expect(check(text(), false)).toBe(true);
    expect(check(text({ pathId: null }), false)).toBe(true);
  });

  it('should also allow text that does have a pathId', () => {
    expect(check(text({ pathId: 'p' }), false)).toBe(true);
  });

  it('should reject flipped, rotated, hidden, blended or stroked text', () => {
    expect(check(text({ flipX: true }), false)).toBe(false);
    expect(check(text({ flipY: true }), false)).toBe(false);
    expect(check(text({ rotation: 10 }), false)).toBe(false);
    expect(check(text({ hidden: true }), false)).toBe(false);
    expect(check(text({ blendMode: BlendMode.multiply }), false)).toBe(false);
    expect(check(text({ strokeWidth: 2 }), false)).toBe(false);
  });

  it('should allow translucent text', () => {
    expect(check(text({ opacity: 0.5 }), false)).toBe(true);
  });

  it('should reject empty text', () => {
    expect(check(text({ content: '' }), false)).toBe(false);
  });

  it('should allow a rotated ancestor but reject a hidden one', () => {
    expect(check(text({ parentId: 'f' }), false, frame({ rotation: 5 }))).toBe(true);
    expect(check(text({ parentId: 'f' }), false, frame({ hidden: true }))).toBe(false);
  });

  it('should reject a blended ancestor when allowBlendMode is false but allow it when true', () => {
    expect(check(text({ parentId: 'f' }), false, frame({ blendMode: BlendMode.screen }))).toBe(false);
    expect(check(text({ parentId: 'f' }), true, frame({ blendMode: BlendMode.screen }))).toBe(true);
  });
});
