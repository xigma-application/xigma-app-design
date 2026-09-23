// types
import { LayoutMode } from 'types/design/enums';

// utils
import { addChildren, addFrame, addRoot, resetPage } from './multiParentFixtures';
import { armDeferredGroupDropTarget } from '../armDeferredGroupDropTarget';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

describe('armDeferredGroupDropTarget', () => {
  beforeEach(resetPage);

  it('should arm a same-frame reorder for a group in an auto-layout frame, clamping the point into the frame', () => {
    // mock
    const frame = addFrame(LayoutMode.vertical, 0, 0);
    const [a] = addChildren(frame, 3);
    const refs = createCanvasRefs();

    // action — a delta far beyond the frame is clamped to its edge
    armDeferredGroupDropTarget(refs, [a], { x: 9000, y: 9000 });

    // result
    expect(refs.transform.dropTargetFrameIdRef.current).toBe(frame);
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toMatchObject({ frameId: frame });
  });

  it('should arm a grid drop hover for a group in a grid frame', () => {
    // mock
    const frame = addFrame(LayoutMode.grid, 0, 0);
    const [a] = addChildren(frame, 1);
    const refs = createCanvasRefs();

    // action
    armDeferredGroupDropTarget(refs, [a], { x: 120, y: 0 });

    // result
    expect(refs.transform.dropTargetFrameIdRef.current).toBe(frame);
    expect(refs.transform.gridDropTargetRef.current).toMatchObject({ frameId: frame });
  });

  it('should arm nothing for a node that is not in a layout frame', () => {
    // mock
    const id = addRoot(10, 10);
    const refs = createCanvasRefs();

    // action
    armDeferredGroupDropTarget(refs, [id], { x: 5, y: 5 });

    // result
    expect(refs.transform.dropTargetFrameIdRef.current).toBeNull();
    expect(refs.transform.gridDropTargetRef.current).toBeNull();
  });

  it('should arm nothing for an empty group', () => {
    // mock
    const refs = createCanvasRefs();

    // action
    armDeferredGroupDropTarget(refs, [], { x: 5, y: 5 });

    // result
    expect(refs.transform.dropTargetFrameIdRef.current).toBeNull();
  });
});
