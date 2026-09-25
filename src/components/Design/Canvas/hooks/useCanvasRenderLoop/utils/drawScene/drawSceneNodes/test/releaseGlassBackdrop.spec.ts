// types
import { TMaskRenderer } from '../types';

// utils
import { glassBackdropStates } from '../glassBackdropStates';
import { releaseGlassBackdrop } from '../releaseGlassBackdrop';

const releaseTargetMock = vi.fn();

vi.mock('../releaseGlassBackdropTarget', () => ({
  releaseGlassBackdropTarget: (...args: unknown[]): unknown => releaseTargetMock(...args),
}));

describe('releaseGlassBackdrop', () => {
  it('should release the backdrop target and forget the state', () => {
    // mock
    const renderer = {} as TMaskRenderer;
    const state = { backdrop: null, dirty: [], fullyDirty: false, isMipmapped: false };
    glassBackdropStates.set(renderer, state);

    // before
    releaseGlassBackdrop(renderer);

    // result
    expect(releaseTargetMock).toHaveBeenCalledWith(renderer, state);
    expect(glassBackdropStates.has(renderer)).toBe(false);
  });

  it('should do nothing for a renderer without a state', () => {
    // mock
    releaseTargetMock.mockClear();

    // before
    releaseGlassBackdrop({} as TMaskRenderer);

    // result
    expect(releaseTargetMock).not.toHaveBeenCalled();
  });
});
