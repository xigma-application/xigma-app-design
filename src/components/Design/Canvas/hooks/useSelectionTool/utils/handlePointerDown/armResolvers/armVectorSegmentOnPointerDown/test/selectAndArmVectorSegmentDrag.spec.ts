// others
import { VECTOR_SEGMENT_INSERT_T } from 'constant/canvas';

// store
import { setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { selectAndArmVectorSegmentDrag } from '../selectAndArmVectorSegmentDrag';

const armMultiDragMock = vi.fn();

vi.mock('../../../armVectorMultiDrag', () => ({ armVectorMultiDrag: (...args: unknown[]): unknown => armMultiDragMock(...args) }));
vi.mock('utils/canvas/vectorNetwork/getVectorSegmentVertexIds', () => ({ getVectorSegmentVertexIds: (): string[] => ['a', 'b'] }));

const canvas = {} as HTMLCanvasElement;
const event = {} as PointerEvent;
const node = { id: 'v' } as TVectorNode;
const refs = (): TCanvasRefs =>
  ({
    vectorEdit: {
      selectedVectorHandlesRef: { current: ['h'] },
      selectedVectorSegmentIdsRef: { current: ['x'] },
      selectedVectorVertexIdsRef: { current: ['y'] },
    },
  }) as unknown as TCanvasRefs;

describe('selectAndArmVectorSegmentDrag', () => {
  beforeAll(() => {
    store.dispatch(setVectorEditingNodeIds(['v']));
  });

  afterAll(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should select only the segment and drag its vertices, splitting it on a plain click at its midpoint', () => {
    // mock
    const canvasRefs = refs();

    // before
    selectAndArmVectorSegmentDrag(canvas, event, canvasRefs, node, 's1', true, { x: 1, y: 2 });

    // result
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual([]);
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
    expect(armMultiDragMock).toHaveBeenCalledWith(
      canvas,
      event,
      canvasRefs,
      expect.any(Object),
      ['v'],
      ['a', 'b'],
      [],
      { x: 1, y: 2 },
      {
        kind: 'split-segment',
        nodeId: 'v',
        segmentId: 's1',
        t: VECTOR_SEGMENT_INSERT_T,
      },
    );
  });

  it('should not split a segment pressed away from its midpoint', () => {
    // before
    selectAndArmVectorSegmentDrag(canvas, event, refs(), node, 's1', false, { x: 1, y: 2 });

    // result
    expect(armMultiDragMock.mock.calls.at(-1)?.[8]).toBeNull();
  });
});
