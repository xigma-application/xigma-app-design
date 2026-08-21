// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { applyAngleSnapToPenPreview } from '../applyAngleSnapToPenPreview';

const createPenPreviewRef = (): TCanvasRefs['penPreviewRef'] => ({ current: null });
const createHoveredSegmentIdRef = (): TCanvasRefs['hoveredSegmentIdRef'] => ({ current: 'stale-segment-id' });
const createPenHoveredDragArmableVertexRef = (): TCanvasRefs['penHoveredDragArmableVertexRef'] => ({ current: true });

describe('applyAngleSnapToPenPreview', () => {
  it('should preview the raw pointer position, unsnapped, when the angle is well outside the tolerance', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();

    // before
    const hoverKind = applyAngleSnapToPenPreview(
      { x: 100, y: 100 },
      { id: 'v1', x: 0, y: 0 },
      null,
      1,
      penPreviewRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
    );

    // result
    expect(penPreviewRef.current).toEqual({
      from: { id: 'v1', x: 0, y: 0 },
      isSnapped: false,
      tangentFromOffset: null,
      to: { x: 100, y: 100 },
    });
    expect(hoverKind).toBeNull();
    expect(hoveredSegmentIdRef.current).toBeNull();
    expect(penHoveredDragArmableVertexRef.current).toBe(false);
  });

  it('should pull the preview onto the nearest cardinal direction and flag it when within tolerance', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();

    // before
    applyAngleSnapToPenPreview(
      { x: 150, y: 3 },
      { id: 'v1', x: 0, y: 0 },
      null,
      1,
      penPreviewRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
    );

    // result
    expect(penPreviewRef.current).toEqual({
      from: { id: 'v1', x: 0, y: 0 },
      isSnapped: true,
      tangentFromOffset: null,
      to: { x: 150, y: 0 },
    });
  });

  it('should carry the given tangentFromOffset through into the preview unchanged', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();

    // before
    applyAngleSnapToPenPreview(
      { x: 100, y: 100 },
      { id: 'v1', x: 0, y: 0 },
      { x: 5, y: 5 },
      1,
      penPreviewRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ tangentFromOffset: { x: 5, y: 5 } });
  });

  it('should shrink the effective tolerance at high zoom, so an angle that snaps at 100% zoom no longer does', () => {
    // mock — atan2(3, 150) ≈ 1.1deg: within tolerance at zoom 1, past it at zoom 10 (0.5deg tolerance)
    const penPreviewRef = createPenPreviewRef();

    // before
    applyAngleSnapToPenPreview(
      { x: 150, y: 3 },
      { id: 'v1', x: 0, y: 0 },
      null,
      10,
      penPreviewRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ isSnapped: false, to: { x: 150, y: 3 } });
  });
});
