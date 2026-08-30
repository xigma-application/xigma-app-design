import { RefObject } from 'react';

// store
import { setViewport } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, PathType } from 'types/design/enums';
import { TDraftEntity } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerMove } from '../handlePointerMove';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createPointRef = (value: TPoint | null): RefObject<TPoint | null> => ({ current: value });
const createStringRef = (value: string | null): RefObject<string | null> => ({ current: value });
const createDraftRef = (): RefObject<TDraftEntity | null> => ({ current: null });

describe('handlePointerMove', () => {
  beforeEach(() => {
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should draft an ellipse path from the start point to the current one when nothing is armed', () => {
    // mock
    const draftRef = createDraftRef();
    const startRef = createPointRef({ x: 10, y: 10 });
    const attachTargetIdRef = createStringRef(null);

    // before
    handlePointerMove(createCanvas(), pointerEvent(60, 60), { x: 0, y: 0, zoom: 1 }, draftRef, startRef, attachTargetIdRef, vi.fn());

    // result
    expect(draftRef.current).toMatchObject({ height: 50, pathType: PathType.ellipse, type: NodeType.path, width: 50, x: 10, y: 10 });
  });

  it('should skip drafting while an attachment target is still armed', () => {
    // mock
    const draftRef = createDraftRef();
    const startRef = createPointRef({ x: 10, y: 10 });
    const attachTargetIdRef = createStringRef('node-1');

    // before — a tiny move, well under the slop tolerance
    handlePointerMove(createCanvas(), pointerEvent(11, 10), { x: 0, y: 0, zoom: 1 }, draftRef, startRef, attachTargetIdRef, vi.fn());

    // result
    expect(draftRef.current).toBeNull();
    expect(attachTargetIdRef.current).toBe('node-1');
  });

  it('should start drafting once the drag disarms an attachment target past the slop tolerance', () => {
    // mock
    const draftRef = createDraftRef();
    const startRef = createPointRef({ x: 10, y: 10 });
    const attachTargetIdRef = createStringRef('node-1');

    // before — a large move, past the slop tolerance
    handlePointerMove(createCanvas(), pointerEvent(110, 10), { x: 0, y: 0, zoom: 1 }, draftRef, startRef, attachTargetIdRef, vi.fn());

    // result
    expect(attachTargetIdRef.current).toBeNull();
    expect(draftRef.current).not.toBeNull();
  });

  it('should preview the attach cursor instead of drafting when the gesture has not started yet', () => {
    // mock
    const draftRef = createDraftRef();
    const startRef = createPointRef(null);
    const attachTargetIdRef = createStringRef(null);
    const setClassName = vi.fn();

    // before
    handlePointerMove(createCanvas(), pointerEvent(0, 0), { x: 0, y: 0, zoom: 1 }, draftRef, startRef, attachTargetIdRef, setClassName);

    // result
    expect(setClassName).toHaveBeenCalledWith('drawing');
    expect(draftRef.current).toBeNull();
  });
});
