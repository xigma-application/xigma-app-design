// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode, TTextNode } from 'types/design/types';

// utils
import { canExportTextAsRealText } from '../canExportTextAsRealText';

const characters = new Set([...'abc'].map((char) => char.charCodeAt(0)));

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

const check = (node: TTextNode, ...ancestors: TSceneNode[]): boolean =>
  canExportTextAsRealText(node, Object.fromEntries(ancestors.map((ancestor) => [ancestor.id, ancestor])), characters);

describe('canExportTextAsRealText', () => {
  it('should allow a plain unrotated text with supported characters', () => {
    expect(check(text())).toBe(true);
  });

  it('should allow line breaks in the content', () => {
    expect(check(text({ content: 'a\nb' }))).toBe(true);
  });

  it('should reject text on a path', () => {
    expect(check(text({ pathId: 'p' }))).toBe(false);
  });

  it('should reject flipped, rotated, hidden, translucent or blended text', () => {
    expect(check(text({ flipX: true }))).toBe(false);
    expect(check(text({ flipY: true }))).toBe(false);
    expect(check(text({ rotation: 10 }))).toBe(false);
    expect(check(text({ hidden: true }))).toBe(false);
    expect(check(text({ opacity: 0.5 }))).toBe(false);
    expect(check(text({ blendMode: BlendMode.multiply }))).toBe(false);
  });

  it('should accept an explicit normal blend mode and full opacity', () => {
    expect(check(text({ blendMode: BlendMode.normal, opacity: 1 }))).toBe(true);
  });

  it('should reject stroked text', () => {
    expect(check(text({ strokeWidth: 2 }))).toBe(false);
  });

  it('should reject empty text and characters missing from the font', () => {
    expect(check(text({ content: '' }))).toBe(false);
    expect(check(text({ content: 'abz' }))).toBe(false);
  });

  it('should allow text inside a plain ancestor chain', () => {
    expect(check(text({ parentId: 'f' }), frame())).toBe(true);
  });

  it('should reject text under a mask ancestor', () => {
    const mask: TSceneNode = {
      childIds: ['t'],
      height: 100,
      id: 'm',
      name: 'm',
      parentId: null,
      rotation: 0,
      type: NodeType.mask,
      width: 100,
      x: 0,
      y: 0,
    };

    expect(check(text({ parentId: 'm' }), mask)).toBe(false);
  });

  it('should allow a rotated ancestor but reject a translucent, hidden or blended one', () => {
    expect(check(text({ parentId: 'f' }), frame({ opacity: 0.5 }))).toBe(false);
    expect(check(text({ parentId: 'f' }), frame({ rotation: 5 }))).toBe(true);
    expect(check(text({ parentId: 'f' }), frame({ hidden: true }))).toBe(false);
    expect(check(text({ parentId: 'f' }), frame({ blendMode: BlendMode.screen }))).toBe(false);
  });

  it('should reject text that overflows a clipping frame but allow it in a non-clipping one', () => {
    expect(check(text({ parentId: 'f', x: 90 }), frame({ clipContent: true }))).toBe(false);
    expect(check(text({ parentId: 'f', x: -5 }), frame({ clipContent: true }))).toBe(false);
    expect(check(text({ parentId: 'f', y: -5 }), frame({ clipContent: true }))).toBe(false);
    expect(check(text({ parentId: 'f', y: 95 }), frame({ clipContent: true }))).toBe(false);
    expect(check(text({ parentId: 'f', x: 90 }), frame({ clipContent: false }))).toBe(true);
    expect(check(text({ parentId: 'f' }), frame({ clipContent: true }))).toBe(true);
  });

  it('should check every ancestor up the chain', () => {
    const inner = frame({ id: 'inner', parentId: 'outer' });
    const outer = frame({ id: 'outer', opacity: 0.4 });

    expect(check(text({ parentId: 'inner' }), inner, outer)).toBe(false);
  });
});
