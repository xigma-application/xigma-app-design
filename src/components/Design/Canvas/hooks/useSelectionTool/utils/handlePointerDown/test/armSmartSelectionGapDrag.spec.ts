// store
import { addNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSmartSelectionGapDragState } from 'types/design/canvas/types';

// utils
import { armSmartSelectionGapDrag } from '../armSmartSelectionGapDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const addRect = (x: number, y: number, width = 50, height = 50): string =>
  store.dispatch(
    addNode({ fill: '#ff0000', height, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }),
  ).payload.id;

describe('armSmartSelectionGapDrag', () => {
  it('should seed the ref with the cascade setup and node origins, then capture the pointer', () => {
    // mock
    const idA = addRect(0, 0);
    const idB = addRect(100, 0);
    const canvas = createCanvas();
    const gapDragRef: { current: TSmartSelectionGapDragState | null } = { current: null };
    const layout = {
      gaps: [],
      nodes: [
        { bounds: { height: 50, width: 50, x: 0, y: 0 }, id: idA },
        { bounds: { height: 50, width: 50, x: 100, y: 0 }, id: idB },
      ],
      type: 'row' as const,
    };

    // before
    armSmartSelectionGapDrag(canvas, pointerEvent(3), gapDragRef, layout, 'x', 50, { x: 75, y: 25 }, { x: 75, y: 25 });

    // result
    expect(gapDragRef.current).toEqual({
      anchorPosition: 0,
      anchorSize: 50,
      axis: 'x',
      badgeAnchor: { x: 75, y: 25 },
      cascadeGroups: [{ nodeIds: [idB], originalPosition: 100, size: 50 }],
      currentGapValue: 50,
      dispatchThrottle: { frameId: null, run: null },
      hasMoved: false,
      nodeOrigins: { [idB]: { x: 100, y: 0 } },
      originalGapValue: 50,
      pointerStart: { x: 75, y: 25 },
    });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(3);
  });
});
