// utils
import { clearNewNodeDropTarget } from '../clearNewNodeDropTarget';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

describe('clearNewNodeDropTarget', () => {
  it('should clear every drop-target preview ref', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    canvasRefs.transform.dropTargetFrameIdRef.current = 'frame-1';
    canvasRefs.transform.autoLayoutDropTargetRef.current = { frameId: 'frame-1' } as never;
    canvasRefs.transform.gridDropTargetRef.current = { cells: [], frameId: 'frame-1' } as never;
    canvasRefs.transform.autoLayoutReorderPreviewRef.current = { frameId: 'frame-1' } as never;

    // before
    clearNewNodeDropTarget(canvasRefs);

    // result
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBeNull();
    expect(canvasRefs.transform.autoLayoutDropTargetRef.current).toBeNull();
    expect(canvasRefs.transform.gridDropTargetRef.current).toBeNull();
    expect(canvasRefs.transform.autoLayoutReorderPreviewRef.current).toBeNull();
  });
});
