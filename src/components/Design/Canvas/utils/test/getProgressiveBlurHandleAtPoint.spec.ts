// types
import { EffectBlurType, EffectType, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getProgressiveBlurHandleAtPoint } from '../getProgressiveBlurHandleAtPoint';

const effect = { ...createEffect(EffectType.layerBlur), blurType: EffectBlurType.progressive };
const node: TRectangleNode = {
  effects: [effect],
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
const viewport = { x: 0, y: 0, zoom: 1 };
const panel = { index: 0, nodeId: 'r1', property: 'effects' as const };

describe('getProgressiveBlurHandleAtPoint', () => {
  it('should hit the start handle at the top center and the end handle at the bottom center by default', () => {
    // result
    expect(getProgressiveBlurHandleAtPoint({ x: 150, y: 62 }, [node], viewport, panel)).toEqual({
      effectIndex: 0,
      endpoint: 'start',
      nodeId: 'r1',
    });
    expect(getProgressiveBlurHandleAtPoint({ x: 152, y: 158 }, [node], viewport, panel)?.endpoint).toBe('end');
  });

  it('should miss away from both handles, and shrink the tolerance with zoom', () => {
    // result
    expect(getProgressiveBlurHandleAtPoint({ x: 150, y: 110 }, [node], viewport, panel)).toBeNull();
    expect(getProgressiveBlurHandleAtPoint({ x: 150, y: 64 }, [node], { x: 0, y: 0, zoom: 4 }, panel)).toBeNull();
  });

  it('should follow the node rotation', () => {
    // mock
    const rotated = { ...node, rotation: 90 };

    // result — the top center rotates around the node center (150, 110) to (200, 110)
    expect(getProgressiveBlurHandleAtPoint({ x: 200, y: 110 }, [rotated], viewport, panel)?.endpoint).toBe('start');
  });

  it('should do nothing unless that effect panel is open on the only selected node and is a progressive blur', () => {
    // result
    expect(getProgressiveBlurHandleAtPoint({ x: 150, y: 60 }, [node], viewport, null)).toBeNull();
    expect(getProgressiveBlurHandleAtPoint({ x: 150, y: 60 }, [node], viewport, { ...panel, property: 'fills' })).toBeNull();
    expect(getProgressiveBlurHandleAtPoint({ x: 150, y: 60 }, [node], viewport, { ...panel, nodeId: 'other' })).toBeNull();
    expect(getProgressiveBlurHandleAtPoint({ x: 150, y: 60 }, [node, node], viewport, panel)).toBeNull();
    expect(
      getProgressiveBlurHandleAtPoint({ x: 150, y: 60 }, [{ ...node, effects: [createEffect(EffectType.layerBlur)] }], viewport, panel),
    ).toBeNull();
    expect(
      getProgressiveBlurHandleAtPoint({ x: 150, y: 60 }, [{ ...node, effects: [{ ...effect, visible: false }] }], viewport, panel),
    ).toBeNull();
    expect(getProgressiveBlurHandleAtPoint({ x: 150, y: 60 }, [{ ...node, effects: undefined }], viewport, panel)).toBeNull();
  });
});
