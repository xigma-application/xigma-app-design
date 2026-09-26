// types
import { EffectType, NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';
import { paintBackgroundBlurShape } from '../paintBackgroundBlurShape';

const node: TRectangleNode = {
  effects: [createEffect(EffectType.backgroundBlur)],
  fills: [{ color: '#ff0000', opacity: 50, type: 'solid' }],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 60,
  x: 0,
  y: 0,
};

describe('paintBackgroundBlurShape', () => {
  it('should paint only the fill of the node shape as an opaque white, without its effects', () => {
    // mock
    const paintLeaf = vi.fn();

    // action
    paintBackgroundBlurShape({ paintLeaf } as unknown as TMaskRenderer, node);

    // result
    expect(paintLeaf).toHaveBeenCalledWith(
      { ...node, effects: undefined, fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }] },
      'fill',
    );
  });

  it('should paint nothing for a node without fills', () => {
    // mock
    const paintLeaf = vi.fn();

    // action
    paintBackgroundBlurShape({ paintLeaf } as unknown as TMaskRenderer, { id: 'l1', type: NodeType.line } as never);

    // result
    expect(paintLeaf).not.toHaveBeenCalled();
  });

  it('should paint every filled area of a vector as an opaque white, without its strokes and effects', () => {
    // mock
    const paintLeaf = vi.fn();
    const vector = makeSquareVector({ effects: node.effects, filledFaceKeys: ['a', 'b'] });

    // action
    paintBackgroundBlurShape({ paintLeaf } as unknown as TMaskRenderer, vector);

    // result
    expect(paintLeaf).toHaveBeenCalledWith(
      {
        ...vector,
        effects: undefined,
        fillByKey: { a: [{ color: '#ffffff', opacity: 100, type: 'solid' }], b: [{ color: '#ffffff', opacity: 100, type: 'solid' }] },
        strokes: [],
      },
      'fill',
    );
  });
});
