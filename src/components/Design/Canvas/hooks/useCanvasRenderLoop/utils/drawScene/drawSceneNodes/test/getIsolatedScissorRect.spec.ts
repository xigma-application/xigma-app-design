// types
import { EffectType, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';
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

  it('should be null for a frame with children, whose content can overflow it', () => {
    // mock
    const frame = { ...node, childIds: ['c1'], clipContent: false, type: NodeType.frame } as unknown as TFrameNode;

    // result
    expect(getIsolatedScissorRect(renderer, frame)).toBeNull();
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
});
