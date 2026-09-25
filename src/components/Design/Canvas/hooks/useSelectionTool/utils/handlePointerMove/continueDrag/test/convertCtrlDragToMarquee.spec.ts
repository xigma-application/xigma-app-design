// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { convertCtrlDragToMarquee } from '../convertCtrlDragToMarquee';

describe('convertCtrlDragToMarquee', () => {
  it('should drop the drag and start a marquee from where it began', () => {
    // mock
    const dragStateRef = { current: { pointerStart: { x: 1, y: 2 } } as TDragState };
    const marqueeStartRef = { current: null as { x: number; y: number } | null };
    const canvasRefs = { vectorSnapshots: { draggedVectorNodeSnapshotsRef: { current: new Map() } } } as unknown as TCanvasRefs;

    // before
    convertCtrlDragToMarquee(dragStateRef.current, dragStateRef, marqueeStartRef, canvasRefs);

    // result
    expect(dragStateRef.current).toBeNull();
    expect(marqueeStartRef.current).toEqual({ x: 1, y: 2 });
    expect(canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current).toBeNull();
  });
});
