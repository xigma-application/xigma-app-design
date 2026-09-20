// types
import { EffectBlurType, EffectType, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { createEffect } from 'utils/design/effects/createEffect';
import { resolveProgressiveBlurHandleHover } from '../resolveProgressiveBlurHandleHover';

const node: TRectangleNode = {
  effects: [{ ...createEffect(EffectType.layerBlur), blurType: EffectBlurType.progressive }],
  fills: [],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};
const panel = { index: 0, nodeId: 'rect-1', property: 'effects' as const };
const viewport = { x: 0, y: 0, zoom: 1 };

describe('resolveProgressiveBlurHandleHover', () => {
  it('should record the hovered endpoint, and clear it once the pointer leaves', () => {
    // mock
    const refs = createCanvasRefs();

    // action
    resolveProgressiveBlurHandleHover({ x: 50, y: 99 }, [node], viewport, panel, refs);

    // result
    expect(refs.progressiveBlur.hoveredEndpointRef.current).toBe('end');

    // action
    resolveProgressiveBlurHandleHover({ x: 10, y: 50 }, [node], viewport, panel, refs);

    // result
    expect(refs.progressiveBlur.hoveredEndpointRef.current).toBeNull();
  });
});
