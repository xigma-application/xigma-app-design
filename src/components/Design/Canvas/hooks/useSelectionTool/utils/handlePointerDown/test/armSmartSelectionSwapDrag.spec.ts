// store
import { addNode, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSmartSelectionSwapDragState } from 'types/design/canvas/types';

// utils
import { armSmartSelectionSwapDrag } from '../armSmartSelectionSwapDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const addRect = (x: number, y: number, width = 50, height = 50): string =>
  store.dispatch(
    addNode({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width,
      x,
      y,
    }),
  ).payload.id;

describe('armSmartSelectionSwapDrag', () => {
  it('should seed the ref with every slot, its node origins and the from index, then capture the pointer', () => {
    // mock
    const idA = addRect(0, 0);
    const idB = addRect(100, 0);
    const idC = addRect(200, 0);
    const canvas = createCanvas();
    const swapDragRef: { current: TSmartSelectionSwapDragState | null } = { current: null };
    const slot = (id: string, x: number): { bounds: { height: number; width: number; x: number; y: number }; id: string } => ({
      bounds: { height: 50, width: 50, x, y: 0 },
      id,
    });
    const layout = { gaps: [], nodes: [slot(idA, 0), slot(idB, 100), slot(idC, 200)], type: 'row' as const };

    // before — grabbed the middle block (slot index 1)
    armSmartSelectionSwapDrag(canvas, pointerEvent(4), swapDragRef, layout, 1, { x: 125, y: 25 });

    // result
    expect(swapDragRef.current).toEqual({
      dispatchThrottle: { frameId: null, run: null },
      fromIndex: 1,
      hasMoved: false,
      nodeOrigins: { [idA]: { x: 0, y: 0 }, [idB]: { x: 100, y: 0 }, [idC]: { x: 200, y: 0 } },
      pointerStart: { x: 125, y: 25 },
      slotNodeIds: { [idA]: [idA], [idB]: [idB], [idC]: [idC] },
      slots: [slot(idA, 0), slot(idB, 100), slot(idC, 200)],
      targetIndex: 1,
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(4);
  });

  it('should move every node inside a Union slot together with the Union and skip empty slots', () => {
    // mock
    const union = addRect(0, 0);
    const child = addRect(0, 0);

    store.dispatch(updateNode({ changes: { childIds: [child], type: NodeType.boolean } as never, id: union }));
    store.dispatch(updateNode({ changes: { parentId: union }, id: child }));
    const other = addRect(100, 0);
    const swapDragRef: { current: TSmartSelectionSwapDragState | null } = { current: null };
    const layout = {
      cells: [
        [
          { bounds: { height: 50, width: 50, x: 0, y: 0 }, id: union },
          { bounds: { height: 50, width: 50, x: 100, y: 0 }, id: other },
          null,
        ],
      ],
      columnCount: 3,
      columnGaps: [],
      geometry: { columnWidth: [50, 50, 50], columnX: [0, 100, 200], rowHeight: [50], rowY: [0] },
      rowCount: 1,
      rowGaps: [],
      type: 'grid' as const,
    };

    // before
    armSmartSelectionSwapDrag(createCanvas(), pointerEvent(), swapDragRef, layout, 0, { x: 25, y: 25 });

    // result
    expect(swapDragRef.current?.slotNodeIds[union]).toEqual([union, child]);
    expect(Object.keys(swapDragRef.current?.nodeOrigins ?? {})).toEqual([union, child, other]);
  });
});
