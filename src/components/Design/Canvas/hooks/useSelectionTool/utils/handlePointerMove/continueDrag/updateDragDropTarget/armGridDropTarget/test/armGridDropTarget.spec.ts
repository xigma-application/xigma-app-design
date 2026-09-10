// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TFrameNode } from 'types/design/types';

// utils
import { armGridDropTarget } from '../armGridDropTarget';

const refs = (): TCanvasRefs => ({ transform: { gridDropTargetRef: { current: null } } }) as unknown as TCanvasRefs;

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  gridColumnCount: 3,
  gridRowCount: 3,
  height: 300,
  id: 'grid-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
  ...overrides,
});

describe('armGridDropTarget', () => {
  it('should write the hovered cell and the count of top-level dragged nodes', () => {
    // mock
    const canvasRefs = refs();

    // action — 100px cells; point at (250, 150) => column 2, row 1; two nodes moving
    armGridDropTarget(canvasRefs, frame(), 'grid-1', ['a', 'b'], {}, { x: 250, y: 150 });

    // result
    expect(canvasRefs.transform.gridDropTargetRef.current).toEqual({
      columnStart: 2,
      count: 2,
      frameId: 'grid-1',
      rowStart: 1,
    });
  });

  it('should let the row grow past the current grid when the pointer is below it', () => {
    // mock
    const canvasRefs = refs();

    // action — pointer well below the 3-row grid
    armGridDropTarget(canvasRefs, frame(), 'grid-1', ['a'], {}, { x: 50, y: 2050 });

    // result
    expect(canvasRefs.transform.gridDropTargetRef.current).toEqual({
      columnStart: 0,
      count: 1,
      frameId: 'grid-1',
      rowStart: 20,
    });
  });

  it('should unrotate the query point about the frame centre for a rotated grid', () => {
    // mock
    const canvasRefs = refs();

    // action — (250, 50) unrotates to the first cell; without unrotation it reads column 2
    armGridDropTarget(canvasRefs, frame({ rotation: 90 }), 'grid-1', ['a'], {}, { x: 250, y: 50 });

    // result
    expect(canvasRefs.transform.gridDropTargetRef.current).toEqual({
      columnStart: 0,
      count: 1,
      frameId: 'grid-1',
      rowStart: 0,
    });
  });

  it('should never write a count below one', () => {
    // mock
    const canvasRefs = refs();

    // action
    armGridDropTarget(canvasRefs, frame(), 'grid-1', [], {}, { x: 50, y: 50 });

    // result
    expect(canvasRefs.transform.gridDropTargetRef.current?.count).toBe(1);
  });
});
