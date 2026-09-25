// types
import { TMaskRenderer } from '../types';

// utils
import { acquireGlassBackdrop } from '../acquireGlassBackdrop';
import { glassBackdropStates } from '../glassBackdropStates';

const captureMock = vi.fn();
const releaseTargetMock = vi.fn();

vi.mock('../captureBackdropTexture', () => ({ captureBackdropTexture: (...args: unknown[]): unknown => captureMock(...args) }));
vi.mock('../releaseGlassBackdropTarget', () => ({
  releaseGlassBackdropTarget: (...args: unknown[]): unknown => releaseTargetMock(...args),
}));

const createRenderer = (): TMaskRenderer =>
  ({ context: { devicePixelHeight: 100, devicePixelWidth: 200 }, gl: {} }) as unknown as TMaskRenderer;
const rect = { height: 10, width: 10, x: 0, y: 0 };

describe('acquireGlassBackdrop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captureMock.mockImplementation(() => ({ id: Math.random() }));
  });

  it('should capture the whole canvas the first time and reuse it while nothing overlapping was drawn', () => {
    // mock
    const renderer = createRenderer();

    // before
    const first = acquireGlassBackdrop(renderer, rect);
    glassBackdropStates.get(renderer)!.dirty.push({ height: 5, width: 5, x: 50, y: 50 });
    const second = acquireGlassBackdrop(renderer, rect);

    // result
    expect(second).toBe(first);
    expect(captureMock).toHaveBeenCalledTimes(1);
    expect(captureMock).toHaveBeenCalledWith(renderer, { height: 100, width: 200, x: 0, y: 0 });
  });

  it('should recapture once something overlapping was drawn or the whole backdrop is dirty', () => {
    // mock
    const renderer = createRenderer();

    // before
    const first = acquireGlassBackdrop(renderer, rect);
    glassBackdropStates.get(renderer)!.dirty.push({ height: 5, width: 5, x: 2, y: 2 });
    const second = acquireGlassBackdrop(renderer, rect);
    glassBackdropStates.get(renderer)!.fullyDirty = true;
    const third = acquireGlassBackdrop(renderer, rect);

    // result
    expect(second).not.toBe(first);
    expect(third).not.toBe(second);
    expect(releaseTargetMock).toHaveBeenCalledTimes(3);
    expect(glassBackdropStates.get(renderer)).toMatchObject({ dirty: [], fullyDirty: false });
  });

  it('should reuse a dirty backdrop when asked to', () => {
    // mock
    const renderer = createRenderer();

    // before
    const first = acquireGlassBackdrop(renderer, rect);
    glassBackdropStates.get(renderer)!.fullyDirty = true;

    // result
    expect(acquireGlassBackdrop(renderer, rect, true)).toBe(first);
  });
});
