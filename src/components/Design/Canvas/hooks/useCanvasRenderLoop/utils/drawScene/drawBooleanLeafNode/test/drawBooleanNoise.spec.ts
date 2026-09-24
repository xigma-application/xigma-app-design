// types
import { BlendMode, EffectType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';

// utils
import { booleanShape } from './fixtures';
import { createEffect } from 'utils/design/effects/createEffect';
import { drawBooleanNoise } from '../drawBooleanNoise';

const drawNoisePolygonMock = vi.fn();
const drawBooleanNoiseMaskMock = vi.fn(() => ({ tag: 'mask' }));
const drawEffectBlendedMock = vi.fn((_context: unknown, _blendMode: unknown, paint: () => void) => paint());

vi.mock('../../drawBoxLeafNode/drawNoisePolygon', () => ({
  drawNoisePolygon: (...args: unknown[]): void => drawNoisePolygonMock(...args),
}));
vi.mock('../drawBooleanNoiseMask', () => ({
  drawBooleanNoiseMask: (...args: unknown[]): unknown => drawBooleanNoiseMaskMock(...(args as [])),
}));
vi.mock('../../drawBoxLeafNode/drawEffectBlended', () => ({
  drawEffectBlended: (...args: [unknown, unknown, () => void]): void => drawEffectBlendedMock(...args),
}));

describe('drawBooleanNoise', () => {
  it('should draw the noise over the shape bounds, masked to the shape and blended with the effect blend mode', () => {
    // mock
    const context = {} as TDrawSceneContext;
    const effect = createEffect(EffectType.noise);

    // action
    drawBooleanNoise(context, booleanShape, effect, 0.5, BlendMode.overlay);

    // result
    expect(drawEffectBlendedMock).toHaveBeenCalledWith(context, BlendMode.overlay, expect.any(Function));
    expect(drawNoisePolygonMock).toHaveBeenCalledWith(
      context,
      effect,
      0.5,
      [
        { x: 10, y: 20 },
        { x: 160, y: 20 },
        { x: 160, y: 120 },
        { x: 10, y: 120 },
      ],
      { x: 85, y: 70 },
      0,
      { tag: 'mask' },
    );
  });
});
