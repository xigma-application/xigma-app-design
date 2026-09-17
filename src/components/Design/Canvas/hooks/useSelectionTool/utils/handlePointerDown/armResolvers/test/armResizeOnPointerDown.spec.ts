// store
import { setImageEditor } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { armResizeOnPointerDown } from '../armResizeOnPointerDown';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

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
    const canvasRefs = createCanvasRefs();

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
    const canvasRefs = createCanvasRefs();

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

  it("should NOT switch the image editor to crop mode yet on arm (regression: flipping the mode here, before the drag even ran, made resizeBoxNode see 'crop' already active and skip scaling the very crop rect this resize is meant to establish — the flip now happens on disarm instead, once the resize is done)", () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'rect-1', paintIndex: 0 }));
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

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
    expect(dispatch).not.toHaveBeenCalledWith(setImageEditor({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0 }));
  });

  it('should also seed the image paint with a crop rect matching the node bounds when entering crop mode', () => {
    // mock
    const imageRectangle: TRectangleNode = {
      ...rectangle,
      fills: [{ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
    };

    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'rect-1', paintIndex: 0 }));
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    armResizeOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 1, y: 1 },
      selectedNodes: [imageRectangle],
      selectionRefs,
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result — the seed rect matches the node's own bounds exactly, so the user immediately sees
    // the same thing they saw before crop mode, with no jump
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          changes: {
            fills: [{ ...imageRectangle.fills[0], crop: { height: 100, rotation: 0, width: 100, x: 0, y: 0 } }],
          },
          id: 'rect-1',
        },
      }),
    );
  });

  it('should not overwrite an existing crop when entering crop mode again', () => {
    // mock
    const alreadyCroppedRectangle: TRectangleNode = {
      ...rectangle,
      fills: [
        {
          crop: { height: 40, rotation: 0, width: 40, x: 5, y: 5 },
          opacity: 100,
          ref: 'image-1',
          rotation: 0,
          scaleMode: 'fill',
          type: 'image',
        },
      ],
    };

    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'rect-1', paintIndex: 0 }));
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

    // before
    armResizeOnPointerDown({
      canvas,
      canvasRefs,
      dispatch,
      event,
      point: { x: 1, y: 1 },
      selectedNodes: [alreadyCroppedRectangle],
      selectionRefs,
      viewport: IDENTITY_VIEWPORT,
    } as never);

    // result — no redundant crop overwrite, and the mode flip is deferred to disarm
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should not dispatch again when the image editor is already in crop mode', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'rect-1', paintIndex: 0 }));
    const dispatch = vi.fn();
    const canvasRefs = createCanvasRefs();

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
    const canvasRefs = createCanvasRefs();

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
    const canvasRefs = createCanvasRefs();

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
