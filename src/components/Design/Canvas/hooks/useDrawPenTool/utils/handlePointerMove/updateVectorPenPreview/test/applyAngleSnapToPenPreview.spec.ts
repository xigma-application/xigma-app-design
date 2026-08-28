// types
import { THoverRefs, TPenRefs, TVectorEditRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { applyAngleSnapToPenPreview } from '../applyAngleSnapToPenPreview';

const nodes: Record<string, TSceneNode> = {};

const createPenPreviewRef = (): TPenRefs['penPreviewRef'] => ({ current: null });
const createHoveredSegmentIdRef = (): THoverRefs['hoveredSegmentIdRef'] => ({ current: 'stale-segment-id' });
const createPenHoveredDragArmableVertexRef = (): TPenRefs['penHoveredDragArmableVertexRef'] => ({ current: true });
const createVectorAlignmentGuideRef = (): TVectorEditRefs['vectorAlignmentGuideRef'] => ({ current: null });

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
      false,
      nodes,
      penPreviewRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      createVectorAlignmentGuideRef(),
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
      false,
      nodes,
      penPreviewRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),
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
      false,
      nodes,
      penPreviewRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),
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
      false,
      nodes,
      penPreviewRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ isSnapped: false, to: { x: 150, y: 3 } });
  });

  it('should hard-constrain to the nearest 15deg increment and always flag it snapped when Shift is held, even at an angle the plain snap ignores', () => {
    // mock — 45deg from (0,0), nowhere near a cardinal direction
    const penPreviewRef = createPenPreviewRef();

    // before — Shift held
    applyAngleSnapToPenPreview(
      { x: 100, y: 100 },
      { id: 'v1', x: 0, y: 0 },
      null,
      1,
      true,
      nodes,
      penPreviewRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),
    );

    // result — a 45deg diagonal drag already lands on a 15deg increment, so the preview commits right
    // where clicked (within floating-point precision of the trig projection non-cardinal angles go
    // through), but flagged as snapped (the hard constraint is always active under Shift)
    expect(penPreviewRef.current?.isSnapped).toBe(true);
    expect(penPreviewRef.current?.to.x).toBeCloseTo(100);
    expect(penPreviewRef.current?.to.y).toBeCloseTo(100);
  });
});
