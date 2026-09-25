// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';
import { TVectorHandleHit } from '../../../../../../../utils/getVectorHandleAtPoint';
import { TVectorNode } from 'types/design/types';

// utils
import { armVectorHandleClick } from '../armVectorHandleClick';

const multiMock = vi.fn();
const groupDragMock = vi.fn();
const selectAndArmMock = vi.fn();

vi.mock('../../../isPartOfVectorMultiSelection', () => ({
  isPartOfVectorMultiSelection: (...args: unknown[]): unknown => multiMock(...args),
}));
vi.mock('../../../armVectorGroupDrag', () => ({ armVectorGroupDrag: (...args: unknown[]): unknown => groupDragMock(...args) }));
vi.mock('../selectAndArmVectorHandleDrag', () => ({
  selectAndArmVectorHandleDrag: (...args: unknown[]): unknown => selectAndArmMock(...args),
}));

const hit = { end: 'start', segmentId: 's1' } as TVectorHandleHit;
const node = { id: 'v' } as TVectorNode;
const canvas = {} as HTMLCanvasElement;
const selectionRefs = {} as TSelectionToolRefs;

const refs = (selected: { end: string; segmentId: string }[]): TCanvasRefs =>
  ({ vectorEdit: { selectedVectorHandlesRef: { current: selected } } }) as unknown as TCanvasRefs;

describe('armVectorHandleClick', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should toggle the handle in the selection with Shift held', () => {
    // mock
    const canvasRefs = refs([{ end: 'start', segmentId: 's1' }]);

    // before
    armVectorHandleClick(canvas, { shiftKey: true } as PointerEvent, canvasRefs, selectionRefs, node, hit, { x: 0, y: 0 });

    // result
    expect(canvasRefs.vectorEdit.selectedVectorHandlesRef.current).toEqual([]);
  });

  it('should drag the whole vector selection when the handle is part of it', () => {
    // mock
    const canvasRefs = refs([{ end: 'end', segmentId: 's1' }]);
    const event = { shiftKey: false } as PointerEvent;
    multiMock.mockReturnValue(true);

    // before
    armVectorHandleClick(canvas, event, canvasRefs, selectionRefs, node, hit, { x: 1, y: 2 });

    // result
    expect(multiMock).toHaveBeenCalledWith(canvasRefs, false);
    expect(groupDragMock).toHaveBeenCalledWith(
      canvas,
      event,
      canvasRefs,
      { x: 1, y: 2 },
      { end: 'start', kind: 'handle', segmentId: 's1' },
    );
  });

  it('should select only this handle and drag it otherwise', () => {
    // mock
    const canvasRefs = refs([]);
    const event = { shiftKey: false } as PointerEvent;
    multiMock.mockReturnValue(false);

    // before
    armVectorHandleClick(canvas, event, canvasRefs, selectionRefs, node, hit, { x: 1, y: 2 });

    // result
    expect(selectAndArmMock).toHaveBeenCalledWith(canvas, event, canvasRefs, selectionRefs, 'v', hit);
  });
});
