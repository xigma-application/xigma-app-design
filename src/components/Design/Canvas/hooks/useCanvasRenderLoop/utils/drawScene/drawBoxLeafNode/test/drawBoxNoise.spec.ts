// types
import { BlendMode, EffectType, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { drawBoxNoise } from '../drawBoxNoise';

const drawEffectBlendedMock = vi.fn();
const drawNoiseShapeMock = vi.fn();

vi.mock('../drawEffectBlended', () => ({
  drawEffectBlended: (...args: unknown[]): void => drawEffectBlendedMock(...args),
}));
vi.mock('../drawNoiseShape', () => ({ drawNoiseShape: (...args: unknown[]): void => drawNoiseShapeMock(...args) }));

const node: TRectangleNode = {
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};

describe('drawBoxNoise', () => {
  it('should paint the noise shape through the blend-mode wrapper', () => {
    // mock
    const context = {} as TDrawSceneContext;
    const effect = createEffect(EffectType.noise);

    // action
    drawBoxNoise(context, node, effect, 0.7, BlendMode.overlay);
    const [, blendMode, paint] = drawEffectBlendedMock.mock.calls[0] as [unknown, BlendMode, () => void];

    paint();

    // result
    expect(blendMode).toBe(BlendMode.overlay);
    expect(drawNoiseShapeMock).toHaveBeenCalledWith(context, node, effect, 0.7);
  });
});
