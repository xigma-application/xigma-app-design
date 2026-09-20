// types
import { BlendMode, EffectType, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { createEffect } from 'utils/design/effects/createEffect';
import { drawBoxEffects } from '../drawBoxEffects';

const drawBoxInnerShadowMock = vi.fn();
const drawBoxDropShadowMock = vi.fn();

vi.mock('../drawBoxDropShadow', () => ({
  drawBoxDropShadow: (...args: unknown[]): void => drawBoxDropShadowMock(...args),
}));
vi.mock('../drawBoxInnerShadow', () => ({
  drawBoxInnerShadow: (...args: unknown[]): void => drawBoxInnerShadowMock(...args),
}));

const context = {} as TDrawSceneContext;
const refs = createCanvasRefs();
const baseNode: TRectangleNode = {
  fills: [],
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

describe('drawBoxEffects', () => {
  beforeEach(() => {
    drawBoxInnerShadowMock.mockClear();
    drawBoxDropShadowMock.mockClear();
  });

  it('should draw every visible inner shadow effect', () => {
    // mock
    const innerShadow = createEffect(EffectType.innerShadow);
    const node = { ...baseNode, effects: [innerShadow] };

    // action
    drawBoxEffects(context, node, 1, refs, EffectType.innerShadow);

    // result
    expect(drawBoxInnerShadowMock).toHaveBeenCalledWith(context, node, innerShadow, 1, BlendMode.normal);
  });

  it('should skip a hidden inner shadow', () => {
    // mock
    const node = { ...baseNode, effects: [{ ...createEffect(EffectType.innerShadow), visible: false }] };

    // action
    drawBoxEffects(context, node, 1, refs, EffectType.innerShadow);

    // result
    expect(drawBoxInnerShadowMock).not.toHaveBeenCalled();
  });

  it('should draw only the effects of the requested type', () => {
    // mock
    const dropShadow = createEffect(EffectType.dropShadow);
    const node = { ...baseNode, effects: [dropShadow, createEffect(EffectType.innerShadow)] };

    // action
    drawBoxEffects(context, node, 1, refs, EffectType.dropShadow);

    // result
    expect(drawBoxDropShadowMock).toHaveBeenCalledTimes(1);
    expect(drawBoxDropShadowMock).toHaveBeenCalledWith(context, node, dropShadow, 1, BlendMode.normal);
    expect(drawBoxInnerShadowMock).not.toHaveBeenCalled();
  });

  it('should do nothing without effects, or when the node has collapsed to zero size', () => {
    // action
    drawBoxEffects(context, baseNode, 1, refs, EffectType.innerShadow);
    drawBoxEffects(context, { ...baseNode, effects: [createEffect(EffectType.innerShadow)], width: 0 }, 1, refs, EffectType.innerShadow);

    // result
    expect(drawBoxInnerShadowMock).not.toHaveBeenCalled();
  });

  it('should pass the effect blend mode, and prefer the hover preview for the matching effect', () => {
    // mock
    const multiplied = { ...createEffect(EffectType.innerShadow), blendMode: BlendMode.multiply };
    const plain = createEffect(EffectType.innerShadow);
    const node = { ...baseNode, effects: [multiplied, plain] };
    const previewRefs = createCanvasRefs({
      blendMode: {
        effectPreviewRef: { current: { blendMode: BlendMode.screen, effectIndex: 1, nodeId: 'r1' } },
        previewRef: { current: null },
      },
    });

    // action
    drawBoxEffects(context, node, 1, previewRefs, EffectType.innerShadow);

    // result
    expect(drawBoxInnerShadowMock).toHaveBeenNthCalledWith(1, context, node, multiplied, 1, BlendMode.multiply);
    expect(drawBoxInnerShadowMock).toHaveBeenNthCalledWith(2, context, node, plain, 1, BlendMode.screen);
  });
});
