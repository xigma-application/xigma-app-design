// store
import { setImageEditor } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { armResizeOnPointerDown } from '../armResizeOnPointerDown';

const armResizeDragMock = vi.fn();

vi.mock('../../armResizeDrag/armResizeDrag', () => ({
  armResizeDrag: (...args: unknown[]): void => armResizeDragMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const rectangle: TRectangleNode = {
  fills: [],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};

const canvas = {} as HTMLCanvasElement;
const event = {} as PointerEvent;
const canvasRefs = {} as never;
const resizeDragRef = { current: null };
const selectionRefs = { resizeDragRef } as never;

describe('armResizeOnPointerDown', () => {
  beforeEach(() => {
    armResizeDragMock.mockClear();
    store.dispatch(setImageEditor(null));
  });

  it('should arm a resize drag when the point hits a corner handle', () => {
    // mock
    const dispatch = vi.fn();

    // before
    const result = armResizeOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 1, y: 1 },
      selectedNodes: [rectangle],
      selectionRefs,
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBe(true);
    expect(armResizeDragMock).toHaveBeenCalledWith(
      canvas,
      event,
      resizeDragRef,
      [rectangle],
      'nw',
      { height: 100, width: 100, x: 0, y: 0 },
      canvasRefs,
    );
  });

  it('should return undefined and arm nothing when the point is far from every handle', () => {
    // mock
    const dispatch = vi.fn();

    // before
    const result = armResizeOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 50, y: 50 },
      selectedNodes: [rectangle],
      selectionRefs,
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(result).toBeUndefined();
    expect(armResizeDragMock).not.toHaveBeenCalled();
  });

  it('should switch the image editor from position to crop mode when resizing the node it targets', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'rect-1', paintIndex: 0 }));
    const dispatch = vi.fn();

    // before
    armResizeOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 1, y: 1 },
      selectedNodes: [rectangle],
      selectionRefs,
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(dispatch).toHaveBeenCalledWith(setImageEditor({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0 }));
  });

  it('should not dispatch again when the image editor is already in crop mode', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0 }));
    const dispatch = vi.fn();

    // before
    armResizeOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 1, y: 1 },
      selectedNodes: [rectangle],
      selectionRefs,
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should not dispatch when the active image editor targets a different node', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'other-node', paintIndex: 0 }));
    const dispatch = vi.fn();

    // before
    armResizeOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 1, y: 1 },
      selectedNodes: [rectangle],
      selectionRefs,
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should not dispatch when there is no active image editor', () => {
    // mock
    const dispatch = vi.fn();

    // before
    armResizeOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 1, y: 1 },
      selectedNodes: [rectangle],
      selectionRefs,
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
