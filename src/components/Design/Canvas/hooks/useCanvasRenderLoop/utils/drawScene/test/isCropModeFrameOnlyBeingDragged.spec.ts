// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { isCropModeFrameOnlyBeingDragged } from '../isCropModeFrameOnlyBeingDragged';

describe('isCropModeFrameOnlyBeingDragged', () => {
  it('should return false when there is no active image editor', () => {
    // mock
    const refs = createCanvasRefs();

    refs.transform.draggedNodeIdsRef.current = new Set(['a']);

    // before / result
    expect(isCropModeFrameOnlyBeingDragged(refs, 'a', null)).toBe(false);
  });

  it("should return false when the image editor is active but not for this node, or not in 'crop' mode", () => {
    // mock
    const refs = createCanvasRefs();

    refs.transform.draggedNodeIdsRef.current = new Set(['a']);

    // result
    expect(isCropModeFrameOnlyBeingDragged(refs, 'a', { mode: 'crop', nodeId: 'other', paintIndex: 0 })).toBe(false);
    expect(isCropModeFrameOnlyBeingDragged(refs, 'a', { mode: 'position', nodeId: 'a', paintIndex: 0 })).toBe(false);
  });

  it('should return false when the node is not actually being dragged', () => {
    // mock
    const refs = createCanvasRefs();

    // before / result
    expect(isCropModeFrameOnlyBeingDragged(refs, 'a', { mode: 'crop', nodeId: 'a', paintIndex: 0 })).toBe(false);
  });

  it('should return false when the node is also being resized or rotated, not just dragged', () => {
    // mock
    const refs = createCanvasRefs();
    const imageEditor = { mode: 'crop' as const, nodeId: 'a', paintIndex: 0 };

    refs.transform.draggedNodeIdsRef.current = new Set(['a']);
    refs.transform.resizedNodeIdsRef.current = new Set(['a']);

    // before / result
    expect(isCropModeFrameOnlyBeingDragged(refs, 'a', imageEditor)).toBe(false);
  });

  it("should return true for the crop-mode frame's own plain move drag", () => {
    // mock
    const refs = createCanvasRefs();

    refs.transform.draggedNodeIdsRef.current = new Set(['a']);

    // before / result
    expect(isCropModeFrameOnlyBeingDragged(refs, 'a', { mode: 'crop', nodeId: 'a', paintIndex: 0 })).toBe(true);
  });
});
