// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { selectAndArmVectorVertexDrag } from '../selectAndArmVectorVertexDrag';

const facesMock = vi.fn();
const armMock = vi.fn();

vi.mock('utils/canvas/vectorNetwork/getVectorFilledFacesTouchingVertexIds', () => ({
  getVectorFilledFacesTouchingVertexIds: (...args: unknown[]): unknown => facesMock(...args),
}));
vi.mock('../armVectorVertexDrag', () => ({ armVectorVertexDrag: (...args: unknown[]): unknown => armMock(...args) }));

const canvas = {} as HTMLCanvasElement;
const event = {} as PointerEvent;
const node = { id: 'v' } as TVectorNode;
const selectionRefs = { vectorVertexDragRef: 'ref' } as unknown as TSelectionToolRefs;
const refs = (): TCanvasRefs =>
  ({
    vectorEdit: {
      selectedVectorHandlesRef: { current: ['h'] },
      selectedVectorSegmentIdsRef: { current: ['s'] },
      selectedVectorVertexIdsRef: { current: [] },
    },
    vectorSnapshots: { draggedVectorFillFacesRef: { current: 'old' } },
  }) as unknown as TCanvasRefs;

describe('selectAndArmVectorVertexDrag', () => {
  it('should select only the vertex, remember the filled faces it moves and arm dragging it', () => {
    // mock
    const canvasRefs = refs();
    facesMock.mockReturnValue([{ key: 'f1' }]);

    // before
    selectAndArmVectorVertexDrag(canvas, event, canvasRefs, selectionRefs, node, 'a', { x: 1, y: 2 });

    // result
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['a']);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(canvasRefs.vectorSnapshots.draggedVectorFillFacesRef.current).toEqual({ v: ['f1'] });
    expect(armMock).toHaveBeenCalledWith(canvas, event, 'ref', node, 'a', { x: 1, y: 2 });
  });

  it('should clear the dragged faces when the vertex touches no filled face', () => {
    // mock
    const canvasRefs = refs();
    facesMock.mockReturnValue([]);

    // before
    selectAndArmVectorVertexDrag(canvas, event, canvasRefs, selectionRefs, node, 'a', { x: 1, y: 2 });

    // result
    expect(canvasRefs.vectorSnapshots.draggedVectorFillFacesRef.current).toBeNull();
  });
});
