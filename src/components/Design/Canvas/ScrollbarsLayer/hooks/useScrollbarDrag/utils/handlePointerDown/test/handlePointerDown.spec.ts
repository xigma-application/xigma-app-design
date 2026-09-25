// types
import { MouseButton } from 'types/enums';
import { TLayoutRefs } from 'types/design/canvas/types';

// utils
import { handlePointerDown } from '../handlePointerDown';

vi.mock('../../../../../utils/getScrollGeometry', () => ({
  getScrollGeometry: (): unknown => ({
    range: { height: 400, width: 2000, x: -500, y: -100 },
    visibleRect: { height: 200, width: 1000, x: 0, y: 0 },
  }),
}));
vi.mock('../../../../../utils/getScrollbarThumb', () => ({ getScrollbarThumb: (): unknown => ({ offset: 250, size: 500 }) }));

const createRefs = (): { anchorRef: { current: unknown }; draggingRef: { current: boolean }; frozenRangeRef: { current: unknown } } => ({
  anchorRef: { current: null },
  draggingRef: { current: false },
  frozenRangeRef: { current: null },
});

const canvas = { getBoundingClientRect: (): DOMRect => ({}) as DOMRect } as HTMLCanvasElement;

describe('handlePointerDown', () => {
  it('should anchor a horizontal thumb drag and freeze the scroll range', () => {
    // mock
    const thumb = { setPointerCapture: vi.fn() } as unknown as HTMLDivElement;
    const event = {
      button: MouseButton.primary,
      clientX: 40,
      clientY: 5,
      pointerId: 3,
      stopPropagation: vi.fn(),
    } as unknown as PointerEvent;
    const refs = createRefs();

    // before
    handlePointerDown(
      canvas,
      thumb,
      event,
      'x',
      {} as TLayoutRefs,
      refs.frozenRangeRef as never,
      refs.draggingRef,
      refs.anchorRef as never,
    );

    // result
    expect(refs.anchorRef.current).toEqual({
      clientPos: 40,
      offset: 250,
      size: 500,
      trackLength: 1000,
      viewportValue: expect.any(Number),
      worldPerTrackPx: 2,
    });
    expect(refs.frozenRangeRef.current).toEqual({ rangeLength: 2000 });
    expect(refs.draggingRef.current).toBe(true);
    expect(thumb.setPointerCapture).toHaveBeenCalledWith(3);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should anchor a vertical thumb drag', () => {
    // mock
    const refs = createRefs();
    const event = {
      button: MouseButton.primary,
      clientX: 40,
      clientY: 5,
      pointerId: 3,
      stopPropagation: vi.fn(),
    } as unknown as PointerEvent;

    // before
    handlePointerDown(
      canvas,
      { setPointerCapture: vi.fn() } as unknown as HTMLDivElement,
      event,
      'y',
      {} as TLayoutRefs,
      refs.frozenRangeRef as never,
      refs.draggingRef,
      refs.anchorRef as never,
    );

    // result
    expect(refs.anchorRef.current).toMatchObject({ clientPos: 5, trackLength: 200, worldPerTrackPx: 2 });
  });

  it('should ignore other mouse buttons', () => {
    // mock
    const refs = createRefs();

    // before
    handlePointerDown(
      canvas,
      {} as HTMLDivElement,
      { button: 2 } as PointerEvent,
      'x',
      {} as TLayoutRefs,
      refs.frozenRangeRef as never,
      refs.draggingRef,
      refs.anchorRef as never,
    );

    // result
    expect(refs.draggingRef.current).toBe(false);
  });
});
