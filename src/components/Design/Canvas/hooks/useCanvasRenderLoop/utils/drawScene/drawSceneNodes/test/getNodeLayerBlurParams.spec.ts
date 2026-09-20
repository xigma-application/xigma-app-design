// types
import { EffectBlurType, EffectType, NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getNodeLayerBlurParams } from '../getNodeLayerBlurParams';

const renderer = {
  context: { canvasWidth: 1000, viewport: { x: 10, y: 20, zoom: 2 } },
  gl: { drawingBufferHeight: 1200, drawingBufferWidth: 2000 },
} as unknown as TMaskRenderer;

const node: TRectangleNode = {
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

describe('getNodeLayerBlurParams', () => {
  it('should return null without a layer blur', () => {
    // result
    expect(getNodeLayerBlurParams(renderer, node)).toBeNull();
    expect(getNodeLayerBlurParams(renderer, { ...node, effects: [createEffect(EffectType.dropShadow)] })).toBeNull();
  });

  it('should scale a uniform blur by zoom and pixel ratio', () => {
    // mock
    const effects = [{ ...createEffect(EffectType.layerBlur), blur: 4 }];

    // result
    expect(getNodeLayerBlurParams(renderer, { ...node, effects })).toEqual({ radius: 16 });
  });

  it('should map a progressive blur line to target pixels with a flipped y and scale both radii', () => {
    // mock
    const effects = [{ ...createEffect(EffectType.layerBlur), blur: 4, blurType: EffectBlurType.progressive, startBlur: 1 }];

    // action
    const params = getNodeLayerBlurParams(renderer, { ...node, effects });

    // result — top center (150, 60) and bottom center (150, 160) in world space
    expect(params).toEqual({
      progressive: { line: [620, 1200 - 280, 620, 1200 - 680], radii: [4, 16] },
      radius: 16,
    });
  });
});
