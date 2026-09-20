// types
import { BlendMode } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';

// utils
import { drawEffectBlended } from '../drawEffectBlended';

const drawEffectIsolatedMock = vi.fn();

vi.mock('../drawEffectIsolated', () => ({
  drawEffectIsolated: (...args: unknown[]): void => drawEffectIsolatedMock(...args),
}));

const context = {} as TDrawSceneContext;

describe('drawEffectBlended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should paint straight for no blend mode, Normal and Pass through', () => {
    // mock
    const paint = vi.fn();

    // action
    drawEffectBlended(context, undefined, paint);
    drawEffectBlended(context, BlendMode.normal, paint);
    drawEffectBlended(context, BlendMode.passThrough, paint);

    // result
    expect(paint).toHaveBeenCalledTimes(3);
    expect(drawEffectIsolatedMock).not.toHaveBeenCalled();
  });

  it('should isolate the paint for a real blend mode', () => {
    // mock
    const paint = vi.fn();

    // action
    drawEffectBlended(context, BlendMode.screen, paint);

    // result
    expect(drawEffectIsolatedMock).toHaveBeenCalledWith(context, BlendMode.screen, paint);
    expect(paint).not.toHaveBeenCalled();
  });
});
