// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { armVectorSegmentClick } from '../armVectorSegmentClick';

const multiMock = vi.fn();
const groupDragMock = vi.fn();
const selectAndArmMock = vi.fn();

vi.mock('../../../isPartOfVectorMultiSelection', () => ({
  isPartOfVectorMultiSelection: (...args: unknown[]): unknown => multiMock(...args),
}));
vi.mock('../../../armVectorGroupDrag', () => ({ armVectorGroupDrag: (...args: unknown[]): unknown => groupDragMock(...args) }));
vi.mock('../selectAndArmVectorSegmentDrag', () => ({
  selectAndArmVectorSegmentDrag: (...args: unknown[]): unknown => selectAndArmMock(...args),
}));

const canvas = {} as HTMLCanvasElement;
const node = { id: 'v' } as TVectorNode;
const refs = (selected: string[]): TCanvasRefs =>
  ({ vectorEdit: { selectedVectorSegmentIdsRef: { current: selected } } }) as unknown as TCanvasRefs;

describe('armVectorSegmentClick', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should toggle the segment in the selection with Shift held', () => {
    // mock
    const canvasRefs = refs(['s1']);

    // before
    armVectorSegmentClick(canvas, { shiftKey: true } as PointerEvent, canvasRefs, node, 's1', false, { x: 0, y: 0 });

    // result
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual([]);
  });

  it('should drag the whole vector selection when the segment is part of it', () => {
    // mock
    const canvasRefs = refs(['s1']);
    const event = { shiftKey: false } as PointerEvent;
    multiMock.mockReturnValue(true);

    // before
    armVectorSegmentClick(canvas, event, canvasRefs, node, 's1', false, { x: 1, y: 2 });

    // result
    expect(multiMock).toHaveBeenCalledWith(canvasRefs, true);
    expect(groupDragMock).toHaveBeenCalledWith(canvas, event, canvasRefs, { x: 1, y: 2 }, { id: 's1', kind: 'segment' });
  });

  it('should select only this segment and drag it otherwise', () => {
    // mock
    const canvasRefs = refs([]);
    const event = { shiftKey: false } as PointerEvent;
    multiMock.mockReturnValue(false);

    // before
    armVectorSegmentClick(canvas, event, canvasRefs, node, 's1', true, { x: 1, y: 2 });

    // result
    expect(selectAndArmMock).toHaveBeenCalledWith(canvas, event, canvasRefs, node, 's1', true, { x: 1, y: 2 });
  });
});
