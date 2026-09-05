// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { handleShiftKeyChange } from '../handleShiftKeyChange';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const keyboardEvent = (key: string, shiftKey = true): KeyboardEvent => new KeyboardEvent('keydown', { key, shiftKey });

describe('handleShiftKeyChange', () => {
  it('should ignore a non-Shift key', () => {
    // mock
    const canvas = createCanvas();
    const startRef = { current: { x: 0, y: 0 } };
    const lastPointerClientPositionRef = { current: { x: 100, y: 20 } };
    const refs = createCanvasRefs();

    // before
    handleShiftKeyChange(
      canvas,
      keyboardEvent('Alt'),
      refs,
      IDENTITY_VIEWPORT,
      startRef,
      lastPointerClientPositionRef,
      'default',
      'default',
      '#000000',
    );

    // result
    expect(refs.draftRef.current).toBeNull();
  });

  it('should do nothing when no drag has started yet', () => {
    // mock
    const canvas = createCanvas();
    const startRef = { current: null };
    const lastPointerClientPositionRef = { current: { x: 100, y: 20 } };
    const refs = createCanvasRefs();

    // before
    handleShiftKeyChange(
      canvas,
      keyboardEvent('Shift'),
      refs,
      IDENTITY_VIEWPORT,
      startRef,
      lastPointerClientPositionRef,
      'default',
      'default',
      '#000000',
    );

    // result
    expect(refs.draftRef.current).toBeNull();
  });

  it('should do nothing when the pointer has never moved over the canvas', () => {
    // mock
    const canvas = createCanvas();
    const startRef = { current: { x: 0, y: 0 } };
    const lastPointerClientPositionRef = { current: null };
    const refs = createCanvasRefs();

    // before
    handleShiftKeyChange(
      canvas,
      keyboardEvent('Shift'),
      refs,
      IDENTITY_VIEWPORT,
      startRef,
      lastPointerClientPositionRef,
      'default',
      'default',
      '#000000',
    );

    // result
    expect(refs.draftRef.current).toBeNull();
  });

  it('should re-evaluate the draft at the last known pointer position, hard-snapping to the nearest 15° increment', () => {
    // mock — same (0,0) -> (100,20) drag used by the hook-level test, re-triggered via Shift alone
    const canvas = createCanvas();
    const startRef = { current: { x: 0, y: 0 } };
    const lastPointerClientPositionRef = { current: { x: 100, y: 20 } };
    const refs = createCanvasRefs();

    // before
    handleShiftKeyChange(
      canvas,
      keyboardEvent('Shift', true),
      refs,
      IDENTITY_VIEWPORT,
      startRef,
      lastPointerClientPositionRef,
      'default',
      'default',
      '#000000',
    );

    // result
    expect(refs.draftRef.current).toMatchObject({ x2: 98, y2: 26 });
  });
});
