// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';
import { TVectorHandleHit } from '../../../../../../../utils/getVectorHandleAtPoint';

// utils
import { selectAndArmVectorHandleDrag } from '../selectAndArmVectorHandleDrag';

const armMock = vi.fn();

vi.mock('../../../armVectorHandleDrag', () => ({ armVectorHandleDrag: (...args: unknown[]): unknown => armMock(...args) }));

describe('selectAndArmVectorHandleDrag', () => {
  it('should select only the hit handle and arm dragging it', () => {
    // mock
    const canvasRefs = {
      vectorEdit: {
        selectedVectorHandlesRef: { current: [] },
        selectedVectorSegmentIdsRef: { current: ['s'] },
        selectedVectorVertexIdsRef: { current: ['a'] },
      },
    } as unknown as TCanvasRefs;
    const selectionRefs = { vectorHandleDragRef: 'ref' } as unknown as TSelectionToolRefs;
    const hit = { end: 'end', segmentId: 's1' } as TVectorHandleHit;
    const canvas = {} as HTMLCanvasElement;
    const event = {} as PointerEvent;

    // before
    selectAndArmVectorHandleDrag(canvas, event, canvasRefs, selectionRefs, 'v', hit);

    // result
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([{ end: 'end', segmentId: 's1' }]);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
    expect(armMock).toHaveBeenCalledWith(canvas, event, 'ref', 'v', hit);
  });
});
