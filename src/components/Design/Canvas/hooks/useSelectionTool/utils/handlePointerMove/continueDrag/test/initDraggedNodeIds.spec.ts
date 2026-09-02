// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { initDraggedNodeIds } from '../initDraggedNodeIds';

const canvasRefs = (current: Set<string> | null): TCanvasRefs =>
  ({ transform: { draggedNodeIdsRef: { current } } }) as unknown as TCanvasRefs;

const dragState = (): TDragState => ({ nodeOrigins: { a: { x: 0, y: 0 }, b: { x: 10, y: 10 } } }) as unknown as TDragState;

describe('initDraggedNodeIds', () => {
  it('should set the ref to the dragged node id set when it is empty', () => {
    // mock
    const refs = canvasRefs(null);

    // action
    initDraggedNodeIds(refs, dragState());

    // result
    expect(refs.transform.draggedNodeIdsRef.current).toEqual(new Set(['a', 'b']));
  });

  it('should leave an already-populated ref untouched', () => {
    // mock
    const existing = new Set(['x']);
    const refs = canvasRefs(existing);

    // action
    initDraggedNodeIds(refs, dragState());

    // result
    expect(refs.transform.draggedNodeIdsRef.current).toBe(existing);
  });
});
