// types
import { EffectBlurType, EffectType, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { createEffect } from 'utils/design/effects/createEffect';
import { drawProgressiveBlurHandleLayer } from '../drawProgressiveBlurHandleLayer';

const drawGradientLineMock = vi.fn();
const drawGradientEndpointHandlesMock = vi.fn();
const drawProgressiveBlurLabelMock = vi.fn();

vi.mock('../../drawGradientHandleLayer/drawGradientLine', () => ({
  drawGradientLine: (...args: unknown[]): void => drawGradientLineMock(...args),
}));
vi.mock('../../drawGradientHandleLayer/drawGradientEndpointHandles', () => ({
  drawGradientEndpointHandles: (...args: unknown[]): void => drawGradientEndpointHandlesMock(...args),
}));
vi.mock('../drawProgressiveBlurLabel', () => ({
  drawProgressiveBlurLabel: (...args: unknown[]): void => drawProgressiveBlurLabelMock(...args),
}));

const context = {} as TDrawSceneContext;
const node: TRectangleNode = {
  effects: [{ ...createEffect(EffectType.layerBlur), blur: 6, blurType: EffectBlurType.progressive }],
  fills: [],
  height: 100,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 200,
  x: 10,
  y: 20,
};
const panel = { index: 0, nodeId: 'r1', property: 'effects' as const };

describe('drawProgressiveBlurHandleLayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw the line and both handles while the progressive panel is open, without a label when nothing is hovered', () => {
    // action
    drawProgressiveBlurHandleLayer(context, [node], panel, createCanvasRefs());

    // result
    const start = { x: 110, y: 20 };
    const end = { x: 110, y: 120 };

    expect(drawGradientLineMock).toHaveBeenCalledWith(context, start, end);
    expect(drawGradientEndpointHandlesMock).toHaveBeenCalledWith(context, [start, end]);
    expect(drawProgressiveBlurLabelMock).not.toHaveBeenCalled();
  });

  it('should label the hovered endpoint with its value', () => {
    // mock
    const refs = createCanvasRefs();

    refs.progressiveBlur.hoveredEndpointRef.current = 'end';

    // action
    drawProgressiveBlurHandleLayer(context, [node], panel, refs);

    // result
    expect(drawProgressiveBlurLabelMock).toHaveBeenCalledWith(context, { x: 110, y: 120 }, 'End 6');
  });

  it('should draw nothing without an open progressive panel', () => {
    // action
    drawProgressiveBlurHandleLayer(context, [node], null, createCanvasRefs());

    // result
    expect(drawGradientLineMock).not.toHaveBeenCalled();
  });
});
