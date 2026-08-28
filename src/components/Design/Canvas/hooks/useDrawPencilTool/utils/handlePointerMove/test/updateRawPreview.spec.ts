// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { updateRawPreview } from '../updateRawPreview';

const pointerEvent = (options: Partial<PointerEventInit> = {}): PointerEvent => new PointerEvent('pointermove', options);

describe('updateRawPreview', () => {
  it('should mark raw-preview mode active and record the raw point when Ctrl is held', () => {
    // mock
    const refs = createCanvasRefs();
    const rawPoints = [{ x: 0, y: 0 }];

    // before
    updateRawPreview(pointerEvent({ ctrlKey: true }), refs, rawPoints, { x: 5, y: 0 });

    // result
    expect(refs.pencil.pencilShowRawPreviewRef.current).toBe(true);
    expect(rawPoints).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ]);
    expect(refs.pencil.pencilRawPreviewPointsRef.current).toEqual(rawPoints);
  });

  it('should also mark raw-preview mode active when Meta (Cmd) is held instead of Ctrl, since Mac users hold Cmd for this', () => {
    // mock — Mac keyboards have no reliable dedicated Ctrl-hold gesture in every context, so Cmd
    // (metaKey) must trigger the same "brutal mode" as Ctrl does on other platforms
    const refs = createCanvasRefs();
    const rawPoints = [{ x: 0, y: 0 }];

    // before
    updateRawPreview(pointerEvent({ metaKey: true }), refs, rawPoints, { x: 5, y: 0 });

    // result
    expect(refs.pencil.pencilShowRawPreviewRef.current).toBe(true);
    expect(refs.pencil.pencilRawPreviewPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ]);
  });

  it('should mark raw-preview mode inactive and clear the raw preview points when neither Ctrl nor Meta is held', () => {
    // mock
    const refs = createCanvasRefs();

    refs.pencil.pencilShowRawPreviewRef.current = true;
    refs.pencil.pencilRawPreviewPointsRef.current = [{ x: -1, y: -1 }];

    // before
    updateRawPreview(pointerEvent(), refs, [{ x: 0, y: 0 }], { x: 5, y: 0 });

    // result
    expect(refs.pencil.pencilShowRawPreviewRef.current).toBe(false);
    expect(refs.pencil.pencilRawPreviewPointsRef.current).toBeNull();
  });
});
