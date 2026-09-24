// types
import { TChangedNodes } from 'store/design/utils/getChangedNodes';
import { TMaskRenderer } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { isGlassRectAffected } from '../isGlassRectAffected';

const renderer = {
  context: { canvasWidth: 1000, viewport: { x: 0, y: 0, zoom: 1 } },
  gl: { drawingBufferHeight: 1000, drawingBufferWidth: 1000 },
} as unknown as TMaskRenderer;

// device rects are bottom-origin: y 400..500 of a 1000 px canvas is world y 500..600
const GLASS_RECT = { height: 100, width: 100, x: 400, y: 400 };

const createNode = (id: string, x: number, y: number, extra: Record<string, unknown> = {}): TSceneNode =>
  ({ height: 40, id, rotation: 0, type: 'rectangle', width: 40, x, y, ...extra }) as unknown as TSceneNode;

const changed = (nodes: TSceneNode[], extra: Partial<TChangedNodes> = {}): TChangedNodes => ({
  added: 0,
  all: false,
  ids: new Set(nodes.map((node) => node.id)),
  nodes,
  removed: 0,
  ...extra,
});

describe('isGlassRectAffected', () => {
  it('should be affected when too many nodes changed to track', () => {
    // result
    expect(isGlassRectAffected(renderer, 'glass', GLASS_RECT, changed([], { all: true }))).toBe(true);
  });

  it('should be affected when the glass node itself changed', () => {
    // result
    expect(isGlassRectAffected(renderer, 'glass', GLASS_RECT, changed([createNode('glass', 0, 0)]))).toBe(true);
  });

  it('should be unaffected by a change far away from the glass rect', () => {
    // result
    expect(isGlassRectAffected(renderer, 'glass', GLASS_RECT, changed([createNode('far', 10, 10)]))).toBe(false);
  });

  it('should be affected by a change that overlaps the glass rect', () => {
    // result
    expect(isGlassRectAffected(renderer, 'glass', GLASS_RECT, changed([createNode('near', 450, 520)]))).toBe(true);
  });

  it('should be affected by a rotated change whose effect margin reaches the glass rect', () => {
    // mock
    const shadowed = createNode('shadowed', 300, 520, { effects: [{ blur: 40, spread: 0, type: 'dropShadow', x: 0, y: 0 }], rotation: 30 });

    // result
    expect(isGlassRectAffected(renderer, 'glass', GLASS_RECT, changed([shadowed]))).toBe(true);
  });

  it('should ignore a change that is off screen', () => {
    // result
    expect(isGlassRectAffected(renderer, 'glass', GLASS_RECT, changed([createNode('off', 9000, 9000)]))).toBe(false);
  });

  it('should treat a node without rotation as unrotated and use a device pixel ratio of one without a canvas width', () => {
    // mock
    const noRotation = { height: 40, id: 'plain', type: 'rectangle', width: 40, x: 450, y: 520 } as unknown as TSceneNode;
    const zeroWidth = { ...renderer, context: { canvasWidth: 0, viewport: { x: 0, y: 0, zoom: 1 } } } as unknown as TMaskRenderer;

    // result
    expect(isGlassRectAffected(zeroWidth, 'glass', GLASS_RECT, changed([noRotation]))).toBe(true);
  });
});
