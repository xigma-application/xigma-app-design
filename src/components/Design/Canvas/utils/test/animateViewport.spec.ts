// others
import { ZOOM_ANIMATION_DURATION_MS } from '../../constants';

// store
import { setViewport } from 'store/design/slice';

// utils
import { animateViewport } from '../animateViewport';

describe('animateViewport', () => {
  let rafCallbacks: FrameRequestCallback[];
  let now: number;

  beforeEach(() => {
    now = 1000;
    rafCallbacks = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);

      return rafCallbacks.length;
    });
    vi.spyOn(performance, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const flush = (): void => {
    const callback = rafCallbacks.shift();

    callback?.(now);
  };

  it('should dispatch the exact starting viewport on the first frame', () => {
    // mock
    const dispatch = vi.fn();
    const from = { x: 0, y: 0, zoom: 1 };
    const to = { x: 100, y: 200, zoom: 4 };

    // action
    animateViewport(dispatch, from, to, { x: 0, y: 0 });
    flush();

    // result
    expect(dispatch).toHaveBeenCalledWith(setViewport(from));
  });

  it('should dispatch the exact target viewport once the duration has elapsed', () => {
    // mock
    const dispatch = vi.fn();
    const from = { x: 0, y: 0, zoom: 1 };
    const to = { x: 100, y: 200, zoom: 4 };

    // action
    animateViewport(dispatch, from, to, { x: 0, y: 0 });
    flush();
    now += ZOOM_ANIMATION_DURATION_MS;
    flush();

    // result
    expect(dispatch).toHaveBeenLastCalledWith(setViewport(to));
  });

  it('should stop scheduling frames once the target is reached', () => {
    // mock
    const dispatch = vi.fn();
    const from = { x: 0, y: 0, zoom: 1 };
    const to = { x: 100, y: 200, zoom: 4 };

    // action
    animateViewport(dispatch, from, to, { x: 0, y: 0 });
    flush();
    now += ZOOM_ANIMATION_DURATION_MS;
    flush();

    // result
    expect(rafCallbacks).toHaveLength(0);
  });

  it('should dispatch an intermediate viewport between the start and target midway through', () => {
    // mock
    const dispatch = vi.fn();
    const from = { x: 0, y: 0, zoom: 1 };
    const to = { x: 100, y: 200, zoom: 4 };

    // action
    animateViewport(dispatch, from, to, { x: 0, y: 0 });
    flush();
    now += ZOOM_ANIMATION_DURATION_MS / 2;
    flush();

    // result
    const [action] = dispatch.mock.calls[1];

    expect(action.payload.x).toBeGreaterThan(from.x);
    expect(action.payload.x).toBeLessThan(to.x);
    expect(action.payload.y).toBeGreaterThan(from.y);
    expect(action.payload.y).toBeLessThan(to.y);
    expect(action.payload.zoom).toBeGreaterThan(from.zoom);
    expect(action.payload.zoom).toBeLessThan(to.zoom);
  });
});
