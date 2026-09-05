// types
import { TAutoLayoutReorderPreview } from 'types/design/canvas/types';

// utils
import { animateAutoLayoutReorder } from '../animateAutoLayoutReorder';
import { AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS } from '../../constants';

describe('animateAutoLayoutReorder', () => {
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

  it('should seed the exact starting positions into the ref synchronously, before the first frame', () => {
    // mock
    const previewRef = { current: null as TAutoLayoutReorderPreview | null };
    const from = { a: { x: 0, y: 0 } };
    const to = { a: { x: 100, y: 0 } };

    // action
    animateAutoLayoutReorder(previewRef, 'frame-1', 2, from, to);

    // result
    expect(previewRef.current).toEqual({ activeIndex: 2, frameId: 'frame-1', positions: { a: { x: 0, y: 0 } } });
  });

  it('should settle on the exact target positions once the duration has elapsed', () => {
    // mock
    const previewRef = { current: null as TAutoLayoutReorderPreview | null };
    const from = { a: { x: 0, y: 0 } };
    const to = { a: { x: 100, y: 200 } };

    // action
    animateAutoLayoutReorder(previewRef, 'frame-1', 0, from, to);
    flush();
    now += AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS;
    flush();

    // result
    expect(previewRef.current?.positions).toEqual({ a: { x: 100, y: 200 } });
  });

  it('should stop scheduling frames once the target is reached', () => {
    // mock
    const previewRef = { current: null as TAutoLayoutReorderPreview | null };

    // action
    animateAutoLayoutReorder(previewRef, 'frame-1', 0, { a: { x: 0, y: 0 } }, { a: { x: 100, y: 0 } });
    flush();
    now += AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS;
    flush();

    // result
    expect(rafCallbacks).toHaveLength(0);
  });

  it('should land on an intermediate position between from and to midway through', () => {
    // mock
    const previewRef = { current: null as TAutoLayoutReorderPreview | null };

    // action
    animateAutoLayoutReorder(previewRef, 'frame-1', 0, { a: { x: 0, y: 0 } }, { a: { x: 100, y: 200 } });
    flush();
    now += AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS / 2;
    flush();

    // result
    const position = previewRef.current?.positions.a;

    expect(position?.x).toBeGreaterThan(0);
    expect(position?.x).toBeLessThan(100);
    expect(position?.y).toBeGreaterThan(0);
    expect(position?.y).toBeLessThan(200);
  });

  it('should preserve an unrelated entry already in the ref (the dragged node’s own ghost position)', () => {
    // mock — the dragged node's own ghost entry, written independently every drag tick
    const previewRef = { current: { activeIndex: 0, frameId: 'frame-1', positions: { dragged: { x: 5, y: 5 } } } };

    // action
    animateAutoLayoutReorder(previewRef, 'frame-1', 1, { a: { x: 0, y: 0 } }, { a: { x: 100, y: 0 } });
    flush();
    now += AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS;
    flush();

    // result
    expect(previewRef.current?.positions.dragged).toEqual({ x: 5, y: 5 });
  });

  it('should start a sibling with no prior recorded position directly at its own target, not lerp from nothing', () => {
    // mock — `to` has a sibling id that `from` never recorded (e.g. it only just joined the frame)
    const previewRef = { current: null as TAutoLayoutReorderPreview | null };

    // action
    animateAutoLayoutReorder(previewRef, 'frame-1', 0, {}, { b: { x: 40, y: 0 } });
    flush();
    now += AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS / 2;
    flush();

    // result — with no recorded starting point, it holds steady at its target the whole time
    expect(previewRef.current?.positions.b).toEqual({ x: 40, y: 0 });
  });

  it('should abandon the animation once a newer trigger changes the active index for the same frame', () => {
    // mock
    const previewRef = { current: null as TAutoLayoutReorderPreview | null };

    // action — first animation armed, then immediately superseded by a retrigger at a new index
    animateAutoLayoutReorder(previewRef, 'frame-1', 0, { a: { x: 0, y: 0 } }, { a: { x: 100, y: 0 } });
    flush();
    animateAutoLayoutReorder(previewRef, 'frame-1', 1, { a: { x: 100, y: 0 } }, { a: { x: 0, y: 0 } });

    now += AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS;
    flush(); // the stale (index 0) tick — should no-op instead of overwriting the newer target

    // result
    expect(previewRef.current).toMatchObject({ activeIndex: 1 });
  });

  it('should abandon the animation once the ref is cleared entirely (drop or cancel)', () => {
    // mock
    const previewRef = { current: null as TAutoLayoutReorderPreview | null };

    // action
    animateAutoLayoutReorder(previewRef, 'frame-1', 0, { a: { x: 0, y: 0 } }, { a: { x: 100, y: 0 } });
    flush();
    previewRef.current = null;
    now += AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS;
    flush();

    // result
    expect(previewRef.current).toBeNull();
    expect(rafCallbacks).toHaveLength(0);
  });
});
