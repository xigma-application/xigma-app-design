import { renderHook } from '@testing-library/react';

// hooks
import { useRegisterColorPixelSampler } from './useRegisterColorPixelSampler';

// others
import { COLOR_SAMPLE_PASSTHROUGH_ATTRIBUTE } from 'constant/canvas';

// utils
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { sampleColorPixels } from 'utils/canvas/colorPixelSampler/colorPixelSamplerRegistry';

// jsdom doesn't implement elementFromPoint at all (not even as a stub), so it has to be assigned
// directly rather than spied on.
let elementFromPointMock: ReturnType<typeof vi.fn<Document['elementFromPoint']>>;

describe('useRegisterColorPixelSampler', () => {
  beforeEach(() => {
    elementFromPointMock = vi.fn();
    document.elementFromPoint = elementFromPointMock;
  });

  it('should file a pending request when the topmost element at the point is the canvas itself', () => {
    // mock
    const canvas = document.createElement('canvas');

    elementFromPointMock.mockReturnValue(canvas);

    // before
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    renderHook(() => useRegisterColorPixelSampler(refs));

    // action
    void sampleColorPixels(12, 34);

    // result
    expect(refs.colorSampleRequestRef.current).toMatchObject({ x: 12, y: 34 });
  });

  it('should resolve the sample once the render loop calls the filed onSample callback', async () => {
    // mock
    const canvas = document.createElement('canvas');

    elementFromPointMock.mockReturnValue(canvas);

    // before
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    renderHook(() => useRegisterColorPixelSampler(refs));

    // action
    const samplePromise = sampleColorPixels(0, 0);

    refs.colorSampleRequestRef.current?.onSample([{ a: 255, b: 1, g: 2, r: 3 }]);

    // result
    expect(await samplePromise).toStrictEqual([{ a: 255, b: 1, g: 2, r: 3 }]);
  });

  it('should resolve null without filing a request when something else is on top of the canvas at that point', async () => {
    // mock — e.g. a modal/panel sitting above the canvas
    const canvas = document.createElement('canvas');
    const modal = document.createElement('div');

    elementFromPointMock.mockReturnValue(modal);

    // before
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    renderHook(() => useRegisterColorPixelSampler(refs));

    // action
    const result = await sampleColorPixels(12, 34);

    // result
    expect(result).toBeNull();
    expect(refs.colorSampleRequestRef.current).toBeNull();
  });

  it('should resolve null when no canvas is mounted yet', async () => {
    // before
    const refs = createCanvasRefs();

    renderHook(() => useRegisterColorPixelSampler(refs));

    // action
    const result = await sampleColorPixels(0, 0);

    // result
    expect(result).toBeNull();
  });

  it('should temporarily neutralize passthrough-marked elements and body pointer-events during the check, then restore them', () => {
    // mock
    const canvas = document.createElement('canvas');
    const mask = document.createElement('div');

    mask.setAttribute(COLOR_SAMPLE_PASSTHROUGH_ATTRIBUTE, '');
    mask.style.pointerEvents = 'all';
    document.body.appendChild(mask);
    document.body.style.pointerEvents = 'none';

    let maskPointerEventsDuringCheck = '';
    let bodyPointerEventsDuringCheck = '';

    elementFromPointMock.mockImplementation(() => {
      maskPointerEventsDuringCheck = mask.style.pointerEvents;
      bodyPointerEventsDuringCheck = document.body.style.pointerEvents;

      return canvas;
    });

    // before
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    renderHook(() => useRegisterColorPixelSampler(refs));

    // action — the whole toggle dance runs synchronously inside the Promise executor, so it's
    // already done by the time this call returns; the request stays pending waiting for a
    // render-loop onSample that this test never sends, which is fine — not the point being tested
    void sampleColorPixels(0, 0);

    // result — both switched to allow hit-testing mid-check, then restored to their original state
    expect(maskPointerEventsDuringCheck).toBe('none');
    expect(bodyPointerEventsDuringCheck).toBe('auto');
    expect(mask.style.pointerEvents).toBe('all');
    expect(document.body.style.pointerEvents).toBe('none');

    // after
    document.body.removeChild(mask);
    document.body.style.pointerEvents = '';
  });

  it('should stop answering sample requests once unmounted', async () => {
    // mock
    const canvas = document.createElement('canvas');

    elementFromPointMock.mockReturnValue(canvas);

    // before
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });
    const { unmount } = renderHook(() => useRegisterColorPixelSampler(refs));

    unmount();

    // action
    const result = await sampleColorPixels(0, 0);

    // result
    expect(result).toBeNull();
  });
});
