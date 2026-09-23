// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { resolveGridNewNodeTarget } from '../resolveGridNewNodeTarget';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [],
  gridAutoPlacement: true,
  gridColumnCount: 2,
  gridRowCount: 2,
  height: 200,
  id: 'grid-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

describe('resolveGridNewNodeTarget', () => {
  it('should target the hovered cell as a flat reading-order index and clear the auto-layout preview', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    canvasRefs.transform.autoLayoutDropTargetRef.current = { frameId: 'stale' } as never;

    // before — 100px cells; point (50, 50) lands in the first cell (column 0, row 0)
    const result = resolveGridNewNodeTarget(canvasRefs, frame(), {}, { x: 50, y: 50 });

    // result
    expect(result).toEqual({ parentId: 'grid-1', targetIndex: 0 });
    expect(canvasRefs.transform.autoLayoutDropTargetRef.current).toBeNull();
    expect(canvasRefs.transform.gridDropTargetRef.current).toEqual({ cells: [{ column: 0, row: 0 }], frameId: 'grid-1' });
  });

  it('should target the next cell over when the first one is already occupied', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const occupant = {
      fills: [],
      gridColumnAnchorIndex: 0,
      gridRowAnchorIndex: 0,
      height: 10,
      id: 'occupant',
      name: 'occupant',
      parentId: 'grid-1',
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    } as never;

    // before — hovering the occupied first cell should insert right after it
    const result = resolveGridNewNodeTarget(canvasRefs, frame({ childIds: ['occupant'] }), { occupant }, { x: 50, y: 50 });

    // result
    expect(result.parentId).toBe('grid-1');
    expect(result.targetIndex).toBeGreaterThanOrEqual(0);
  });
});
