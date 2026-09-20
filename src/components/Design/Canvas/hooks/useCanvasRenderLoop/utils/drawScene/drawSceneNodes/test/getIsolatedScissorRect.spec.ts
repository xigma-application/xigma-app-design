// types
import { EffectType, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';
import { TMaskRenderer } from '../types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getIsolatedScissorRect } from '../getIsolatedScissorRect';

const renderer = {
  context: { canvasWidth: 1000, viewport: { x: 10, y: 20, zoom: 2 } },
  gl: { drawingBufferHeight: 1200, drawingBufferWidth: 2000 },
} as unknown as TMaskRenderer;

const effects = [{ ...createEffect(EffectType.layerBlur), blur: 4 }];

const node: TRectangleNode = {
  effects,
  fills: [],
  height: 100,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 200,
  x: 50,
  y: 60,
};

describe('getIsolatedScissorRect', () => {
  it('should return the node box in device pixels with a y flip, grown by twice the blur radius plus padding', () => {
    // result
    expect(getIsolatedScissorRect(renderer, node)).toEqual({
      clipped: false,
      height: 472,
      originX: 184,
      originY: 484,
      rawHeight: 472,
      rawWidth: 872,
      width: 872,
      x: 184,
      y: 484,
    });
  });

  it('should be null without a layer blur', () => {
    // result
    expect(getIsolatedScissorRect(renderer, { ...node, effects: [] })).toBeNull();
  });

  it('should grow to the children of a frame that does not clip them', () => {
    // mock
    const child = { ...node, effects: [], id: 'c1', x: 150, y: 60 } as TRectangleNode;
    const frame = { ...node, childIds: ['c1'], clipContent: false, type: NodeType.frame } as unknown as TFrameNode;
    const withChild = { ...renderer, sceneNodeById: new Map([['c1', child]]) } as unknown as TMaskRenderer;

    // result — the child sits 100 units to the right, so the rect gets 400 device pixels wider
    expect(getIsolatedScissorRect(withChild, frame)).toEqual(expect.objectContaining({ height: 472, width: 1272, x: 184 }));
  });

  it('should ignore the children of a frame that clips its content', () => {
    // mock
    const child = { ...node, effects: [], id: 'c1', x: 150, y: 60 } as TRectangleNode;
    const frame = { ...node, childIds: ['c1'], clipContent: true, type: NodeType.frame } as unknown as TFrameNode;
    const withChild = { ...renderer, sceneNodeById: new Map([['c1', child]]) } as unknown as TMaskRenderer;

    // result
    expect(getIsolatedScissorRect(withChild, frame)).toEqual(expect.objectContaining({ width: 872 }));
  });

  it('should be null when a child cannot be measured, like a text', () => {
    // mock
    const text = { id: 'c1', type: NodeType.text } as unknown as TSceneNode;
    const frame = { ...node, childIds: ['c1'], clipContent: false, type: NodeType.frame } as unknown as TFrameNode;
    const withText = { ...renderer, sceneNodeById: new Map([['c1', text]]) } as unknown as TMaskRenderer;

    // result
    expect(getIsolatedScissorRect(withText, frame)).toBeNull();
  });

  it('should clamp to the drawing buffer', () => {
    // result
    expect(getIsolatedScissorRect(renderer, { ...node, x: -50, y: -50 })).toEqual(expect.objectContaining({ x: 0 }));
  });

  it('should flag a rect cut by the drawing buffer as clipped and keep its unclamped origin', () => {
    // result
    expect(getIsolatedScissorRect(renderer, { ...node, x: -50, y: -50 })).toEqual(
      expect.objectContaining({ clipped: true, originX: expect.any(Number), x: 0 }),
    );
  });

  it('should grow the rect for a glass effect too, for its frost radius and refraction/dispersion reach', () => {
    // mock
    const glassNode = { ...node, effects: [createEffect(EffectType.glass)] };

    // action
    const withGlass = getIsolatedScissorRect(renderer, glassNode);

    // result — well beyond the plain node box at this zoom (200 x 2 = 400 device px wide)
    expect(withGlass).not.toBeNull();
    expect(withGlass!.width).toBeGreaterThan(400);
  });

  it('should be null for a glass effect that is turned off', () => {
    // result
    expect(getIsolatedScissorRect(renderer, { ...node, effects: [{ ...createEffect(EffectType.glass), visible: false }] })).toBeNull();
  });
});
