// types
import { EffectType, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { drawBoxEffects } from '../drawBoxEffects';

const drawBoxInnerShadowMock = vi.fn();

vi.mock('../drawBoxInnerShadow', () => ({
  drawBoxInnerShadow: (...args: unknown[]): void => drawBoxInnerShadowMock(...args),
}));

const context = {} as TDrawSceneContext;
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
  });

  it('should draw every visible inner shadow effect', () => {
    // mock
    const innerShadow = createEffect(EffectType.innerShadow);
    const node = { ...baseNode, effects: [innerShadow] };

    // action
    drawBoxEffects(context, node, 1);

    // result
    expect(drawBoxInnerShadowMock).toHaveBeenCalledWith(context, node, innerShadow, 1);
  });

  it('should skip a hidden inner shadow', () => {
    // mock
    const node = { ...baseNode, effects: [{ ...createEffect(EffectType.innerShadow), visible: false }] };

    // action
    drawBoxEffects(context, node, 1);

    // result
    expect(drawBoxInnerShadowMock).not.toHaveBeenCalled();
  });

  it('should skip effect types other than inner shadow', () => {
    // mock
    const node = { ...baseNode, effects: [createEffect(EffectType.dropShadow)] };

    // action
    drawBoxEffects(context, node, 1);

    // result
    expect(drawBoxInnerShadowMock).not.toHaveBeenCalled();
  });

  it('should do nothing without effects, or when the node has collapsed to zero size', () => {
    // action
    drawBoxEffects(context, baseNode, 1);
    drawBoxEffects(context, { ...baseNode, effects: [createEffect(EffectType.innerShadow)], width: 0 }, 1);

    // result
    expect(drawBoxInnerShadowMock).not.toHaveBeenCalled();
  });
});
