// types
import { TAutoLayoutReorderPreview } from 'types/design/canvas/types';

// utils
import { AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS } from '../../constants';
import { resolveDraggedBlockOffsets } from '../animateDraggedBlockOffset';

describe('animateDraggedBlockOffset', () => {
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

  const basePreview = (tween?: TAutoLayoutReorderPreview['draggedOffsetTween']): TAutoLayoutReorderPreview => ({
    activeIndex: 0,
    draggedOffsetTween: tween,
    frameId: 'frame-1',
    positions: {},
  });

  describe('resolveDraggedBlockOffsets', () => {
    it('starts a fresh tween at the target offsets and schedules a settle frame', () => {
      // mock
      const preview = basePreview();
      const previewRef = { current: preview };
      const target = { c: { x: 0, y: 0 }, d: { x: 100, y: 0 } };

      // action
      const { offsets, tween } = resolveDraggedBlockOffsets(previewRef, preview, { x: 10, y: 200 }, target, now);

      // result — nothing to animate yet, but the settle loop is armed
      expect(offsets).toEqual(target);
      expect(tween).toEqual({ from: target, grabbedGhost: { x: 10, y: 200 }, startTime: 1000, target });
      expect(rafCallbacks).toHaveLength(1);
    });

    it('keeps the running tween (only refreshing the cursor anchor) when the target is unchanged', () => {
      // mock — a tween already mid-flight
      const tween = {
        from: { c: { x: 0, y: 0 }, d: { x: 100, y: 0 } },
        grabbedGhost: { x: 10, y: 200 },
        startTime: 1000,
        target: { c: { x: 0, y: 0 }, d: { x: 100, y: 0 } },
      };
      const preview = basePreview(tween);
      const previewRef = { current: preview };
      now = 1100;

      // action — same target, cursor moved on
      const result = resolveDraggedBlockOffsets(previewRef, preview, { x: 25, y: 200 }, tween.target, now);

      // result — startTime + from preserved, only grabbedGhost updated, no new settle frame
      expect(result.tween).toEqual({ ...tween, grabbedGhost: { x: 25, y: 200 } });
      expect(rafCallbacks).toHaveLength(0);
    });

    it('hands the tween a new target and seeds `from` with the currently displayed offsets', () => {
      // mock — companion 'd' sits at +100; it is about to flip to -100
      const tween = {
        from: { c: { x: 0, y: 0 }, d: { x: 100, y: 0 } },
        grabbedGhost: { x: 40, y: 200 },
        startTime: 1000,
        target: { c: { x: 0, y: 0 }, d: { x: 100, y: 0 } },
      };
      const preview = basePreview(tween);
      const previewRef = { current: preview };
      const flipped = { c: { x: 0, y: 0 }, d: { x: -100, y: 0 } };

      // action
      const { tween: next } = resolveDraggedBlockOffsets(previewRef, preview, { x: 50, y: 200 }, flipped, now);

      // result — animates from where 'd' currently is toward the flipped target
      expect(next).toEqual({ from: tween.from, grabbedGhost: { x: 50, y: 200 }, startTime: 1000, target: flipped });
      expect(rafCallbacks).toHaveLength(1);
    });

    it('treats a target that differs only on the counter axis as a new target', () => {
      // mock
      const tween = {
        from: { c: { x: 0, y: 0 } },
        grabbedGhost: { x: 0, y: 0 },
        startTime: 1000,
        target: { c: { x: 0, y: 0 } },
      };
      const preview = basePreview(tween);
      const previewRef = { current: preview };

      // action — same x, different y
      resolveDraggedBlockOffsets(previewRef, preview, { x: 0, y: 0 }, { c: { x: 0, y: 40 } }, now);

      // result — a settle frame is armed for the new target
      expect(rafCallbacks).toHaveLength(1);
    });
  });

  describe('settle loop', () => {
    it('eases the block members toward the target and keeps rescheduling until the duration elapses', () => {
      // mock
      const preview = basePreview();
      const previewRef = { current: preview as TAutoLayoutReorderPreview | null };
      const flipped = { c: { x: 0, y: 0 }, d: { x: -100, y: 0 } };

      // action — arm a tween whose `from` still has 'd' at +100
      const { tween } = resolveDraggedBlockOffsets(
        previewRef,
        {
          ...preview,
          draggedOffsetTween: {
            from: { c: { x: 0, y: 0 }, d: { x: 100, y: 0 } },
            grabbedGhost: { x: 50, y: 200 },
            startTime: 1000,
            target: { c: { x: 0, y: 0 }, d: { x: 100, y: 0 } },
          },
        },
        { x: 50, y: 200 },
        flipped,
        now,
      );
      previewRef.current = { ...preview, draggedOffsetTween: tween };
      now = 1100;
      flush();

      // result — 'd' has moved partway from +100 toward -100 (anchored at grabbedGhost x 50); still animating
      const dX = previewRef.current?.positions.d?.x ?? 0;

      expect(dX).toBeGreaterThan(-50);
      expect(dX).toBeLessThan(50);
      expect(rafCallbacks).toHaveLength(1);

      // the rescheduled frame keeps easing toward the target
      now = 1150;
      flush();
      expect(previewRef.current?.positions.d?.x).toBeLessThan(dX);
    });

    it('lands exactly on the target and stops scheduling once the duration is reached', () => {
      // mock
      const preview = basePreview();
      const previewRef = { current: preview as TAutoLayoutReorderPreview | null };
      const flipped = { c: { x: 0, y: 0 }, d: { x: -100, y: 0 } };
      const { tween } = resolveDraggedBlockOffsets(
        previewRef,
        {
          ...preview,
          draggedOffsetTween: {
            from: { c: { x: 0, y: 0 }, d: { x: 100, y: 0 } },
            grabbedGhost: { x: 50, y: 200 },
            startTime: 1000,
            target: { c: { x: 0, y: 0 }, d: { x: 100, y: 0 } },
          },
        },
        { x: 50, y: 200 },
        flipped,
        now,
      );
      previewRef.current = { ...preview, draggedOffsetTween: tween };

      // action
      now = 1000 + AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS;
      flush();

      // result — 'd' is at grabbedGhost.x (50) + target (-100) = -50, and nothing more is queued
      expect(previewRef.current?.positions).toEqual({ c: { x: 50, y: 200 }, d: { x: -50, y: 200 } });
      expect(rafCallbacks).toHaveLength(0);
    });

    it('abandons the frame when a newer tween has replaced this one', () => {
      // mock
      const preview = basePreview();
      const previewRef = { current: preview as TAutoLayoutReorderPreview | null };
      const { tween } = resolveDraggedBlockOffsets(previewRef, preview, { x: 0, y: 0 }, { c: { x: 0, y: 0 } }, now);

      previewRef.current = { ...preview, draggedOffsetTween: { ...tween, startTime: 5000 } };
      now = 1100;

      // action
      flush();

      // result — stale frame (startTime 1000) no-ops against the newer tween (startTime 5000)
      expect(previewRef.current?.positions).toEqual({});
    });

    it('abandons the frame when the preview has been cleared', () => {
      // mock
      const preview = basePreview();
      const previewRef = { current: preview as TAutoLayoutReorderPreview | null };

      resolveDraggedBlockOffsets(previewRef, preview, { x: 0, y: 0 }, { c: { x: 0, y: 0 } }, now);
      previewRef.current = null;

      // action + result — no throw, nothing to do
      expect(() => flush()).not.toThrow();
    });
  });
});
