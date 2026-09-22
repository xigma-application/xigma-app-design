// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { isSafeAncestorChain } from '../isSafeAncestorChain';

const bounds = { height: 10, width: 10, x: 10, y: 10 };

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
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

const check = (allowOpacity: boolean, ...ancestors: TSceneNode[]): boolean =>
  isSafeAncestorChain(bounds, 'f', Object.fromEntries(ancestors.map((ancestor) => [ancestor.id, ancestor])), allowOpacity);

describe('isSafeAncestorChain', () => {
  it('should be safe when there is no parent', () => {
    expect(isSafeAncestorChain(bounds, null, {}, false)).toBe(true);
  });

  it('should be safe for a plain ancestor and unsafe when the parent id is missing from the tree', () => {
    expect(check(false, frame())).toBe(true);
    expect(check(false)).toBe(true);
  });

  it('should reject hidden, blended and mask ancestors', () => {
    expect(check(true, frame({ hidden: true }))).toBe(false);
    expect(check(true, frame({ blendMode: BlendMode.multiply }))).toBe(false);
    expect(
      check(true, { childIds: [], height: 1, id: 'f', name: 'm', parentId: null, rotation: 0, type: NodeType.mask, width: 1, x: 0, y: 0 }),
    ).toBe(false);
  });

  it('should accept a rotated, non-clipping ancestor', () => {
    expect(check(true, frame({ rotation: 45 }))).toBe(true);
  });

  it('should accept a normal blend mode', () => {
    expect(check(true, frame({ blendMode: BlendMode.normal }))).toBe(true);
  });

  it('should only reject translucent ancestors when opacity is not allowed', () => {
    expect(check(false, frame({ opacity: 0.5 }))).toBe(false);
    expect(check(true, frame({ opacity: 0.5 }))).toBe(true);
    expect(check(false, frame({ opacity: 1 }))).toBe(true);
  });

  it('should reject bounds overflowing a clipping frame on any side', () => {
    const clip = { clipContent: true };

    expect(isSafeAncestorChain({ ...bounds, x: -1 }, 'f', { f: frame(clip) }, true)).toBe(false);
    expect(isSafeAncestorChain({ ...bounds, y: -1 }, 'f', { f: frame(clip) }, true)).toBe(false);
    expect(isSafeAncestorChain({ ...bounds, x: 95 }, 'f', { f: frame(clip) }, true)).toBe(false);
    expect(isSafeAncestorChain({ ...bounds, y: 95 }, 'f', { f: frame(clip) }, true)).toBe(false);
    expect(isSafeAncestorChain(bounds, 'f', { f: frame(clip) }, true)).toBe(true);
    expect(isSafeAncestorChain({ ...bounds, x: 95 }, 'f', { f: frame({ clipContent: false }) }, true)).toBe(true);
  });

  it('should check every ancestor up the chain', () => {
    const outer = frame({ hidden: true, id: 'outer' });
    const inner = frame({ id: 'f', parentId: 'outer' });

    expect(check(true, inner, outer)).toBe(false);
  });

  it('should accept bounds contained in a rotated clipping frame even though they fall outside its unrotated axis-aligned rect', () => {
    // ancestor is a 200x50 frame rotated 90°, so its true visual clip region is a 50x200 rect centered at (200,125), spanning x:[175,225] y:[25,225]
    const clip = frame({ clipContent: true, height: 50, rotation: 90, width: 200, x: 100, y: 100 });
    // these bounds sit at y:50..60, outside the frame's own unrotated rect (y:[100,150]), but inside its rotated visual region
    const rotatedBounds = { height: 10, width: 10, x: 180, y: 50 };

    expect(isSafeAncestorChain(rotatedBounds, 'f', { f: clip }, true)).toBe(true);
  });

  it('should still reject bounds genuinely outside a rotated clipping frame', () => {
    const clip = frame({ clipContent: true, height: 50, rotation: 90, width: 200, x: 100, y: 100 });
    const farBounds = { height: 10, width: 10, x: 0, y: 0 };

    expect(isSafeAncestorChain(farBounds, 'f', { f: clip }, true)).toBe(false);
  });
});
