// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getDragCursorClassName } from '../getDragCursorClassName';

const canvasRefs = (dropTargetFrameId: string | null): TCanvasRefs =>
  ({ transform: { autoLayoutDropTargetRef: { current: { frameId: dropTargetFrameId } } } }) as unknown as TCanvasRefs;

const dragState = (reorderModeAbandoned: boolean): TDragState => ({ reorderModeAbandoned }) as unknown as TDragState;

const selectedNodes = (parentId: string | null): TSceneNode[] => [{ parentId } as TSceneNode];

const canvasRefsWithoutDropTarget = (): TCanvasRefs =>
  ({ transform: { autoLayoutDropTargetRef: { current: null } } }) as unknown as TCanvasRefs;

describe('getDragCursorClassName', () => {
  it('should return the strict-reorder class when the reorder modifier is held over the current parent drop target', () => {
    // action
    const className = getDragCursorClassName(canvasRefs('frame-1'), dragState(false), selectedNodes('frame-1'), true, null);

    // result
    expect(className).toBe('strict-mode');
  });

  it('should not return the strict-reorder class once reorder mode has been abandoned', () => {
    // action
    const className = getDragCursorClassName(canvasRefs('frame-1'), dragState(true), selectedNodes('frame-1'), true, null);

    // result
    expect(className).toBeNull();
  });

  it('should not return the strict-reorder class when the drop target frame differs from the current parent', () => {
    // action
    const className = getDragCursorClassName(canvasRefs('frame-2'), dragState(false), selectedNodes('frame-1'), true, null);

    // result
    expect(className).toBeNull();
  });

  it('should fall back to the axis-lock class when the reorder modifier is not held', () => {
    // action
    const className = getDragCursorClassName(canvasRefs('frame-1'), dragState(false), selectedNodes('frame-1'), false, 'x');

    // result
    expect(className).toBe('move-x');
  });

  it('should prefer the strict-reorder class over the axis-lock class', () => {
    // action
    const className = getDragCursorClassName(canvasRefs('frame-1'), dragState(false), selectedNodes('frame-1'), true, 'y');

    // result
    expect(className).toBe('strict-mode');
  });

  it('should not return the strict-reorder class when there is no armed auto-layout drop target', () => {
    // action
    const className = getDragCursorClassName(canvasRefsWithoutDropTarget(), dragState(false), selectedNodes('frame-1'), true, null);

    // result
    expect(className).toBeNull();
  });

  it('should treat an empty selection as having no parent when matching the drop target', () => {
    // action
    const className = getDragCursorClassName(canvasRefs(null), dragState(false), [], true, null);

    // result
    expect(className).toBe('strict-mode');
  });

  it('should return null when neither a strict-reorder cursor nor an axis lock applies', () => {
    // action
    const className = getDragCursorClassName(canvasRefs('frame-1'), dragState(false), selectedNodes('frame-1'), false, null);

    // result
    expect(className).toBeNull();
  });
});
