// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { armVectorVertexClick } from '../armVectorVertexClick';

const multiMock = vi.fn();
const groupDragMock = vi.fn();
const selectAndArmMock = vi.fn();

vi.mock('../../../isPartOfVectorMultiSelection', () => ({
  isPartOfVectorMultiSelection: (...args: unknown[]): unknown => multiMock(...args),
}));
vi.mock('../../../armVectorGroupDrag', () => ({ armVectorGroupDrag: (...args: unknown[]): unknown => groupDragMock(...args) }));
vi.mock('../selectAndArmVectorVertexDrag', () => ({
  selectAndArmVectorVertexDrag: (...args: unknown[]): unknown => selectAndArmMock(...args),
}));

const canvas = {} as HTMLCanvasElement;
const node = { id: 'v' } as TVectorNode;
const selectionRefs = {} as TSelectionToolRefs;
const refs = (selected: string[]): TCanvasRefs =>
  ({ vectorEdit: { selectedVectorVertexIdsRef: { current: selected } } }) as unknown as TCanvasRefs;

describe('armVectorVertexClick', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should toggle the vertex in the selection with Shift held', () => {
    // mock
    const canvasRefs = refs([]);

    // before
    armVectorVertexClick(canvas, { shiftKey: true } as PointerEvent, canvasRefs, selectionRefs, node, { vertexId: 'a' }, { x: 0, y: 0 });

    // result
    expect(canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current).toEqual(['a']);
  });

  it('should drag the whole vector selection when the vertex is part of it', () => {
    // mock
    const canvasRefs = refs(['a']);
    const event = { shiftKey: false } as PointerEvent;
    multiMock.mockReturnValue(true);

    // before
    armVectorVertexClick(canvas, event, canvasRefs, selectionRefs, node, { vertexId: 'a' }, { x: 1, y: 2 });

    // result
    expect(multiMock).toHaveBeenCalledWith(canvasRefs, true);
    expect(groupDragMock).toHaveBeenCalledWith(canvas, event, canvasRefs, { x: 1, y: 2 }, { id: 'a', kind: 'vertex' });
  });

  it('should select only this vertex and drag it otherwise', () => {
    // mock
    const canvasRefs = refs([]);
    const event = { shiftKey: false } as PointerEvent;
    multiMock.mockReturnValue(false);

    // before
    armVectorVertexClick(canvas, event, canvasRefs, selectionRefs, node, { vertexId: 'a' }, { x: 1, y: 2 });

    // result
    expect(selectAndArmMock).toHaveBeenCalledWith(canvas, event, canvasRefs, selectionRefs, node, 'a', { x: 1, y: 2 });
  });
});
