// store
import { addNode, startTextEdit, stopTextEdit } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEditingTextBox } from 'types/canvas';

// utils
import { continueEditingPathOffsetDrag } from '../continueEditingPathOffsetDrag';

const CIRCLE_BOX: TEditingTextBox = {
  flipX: false,
  flipY: false,
  height: 200,
  pathFlip: false,
  pathId: 'ellipse-1',
  pathStartOffset: 0,
  rotation: 0,
  width: 200,
  x: 1000,
  y: 1000,
};

const BOTTOM = { x: 1100, y: 1200 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

describe('continueEditingPathOffsetDrag', () => {
  beforeEach(() => {
    store.dispatch(stopTextEdit());
  });

  it('should do nothing when there is no editing session', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueEditingPathOffsetDrag(canvas, pointerEvent(BOTTOM.x, BOTTOM.y), store.dispatch);

    // result
    expect(store.getState().design.editingTextBox).toBeNull();
  });

  it('should update only the editing box when no committed node exists yet (first-time creation)', () => {
    // mock — startTextEdit with no id, as happens right after useDrawTextOnPathTool finishes drawing
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    const canvas = createCanvas();

    // before — bottom of the ellipse is a quarter turn from the right edge (offset 0)
    continueEditingPathOffsetDrag(canvas, pointerEvent(BOTTOM.x, BOTTOM.y), store.dispatch);

    // result
    expect(store.getState().design.editingTextBox).toMatchObject({ pathStartOffset: expect.closeTo(0.25, 2) });
  });

  it('should still resolve an offset for a plain ellipse path with no bound vector (no pathId)', () => {
    // mock — an ellipse-drawn text path never gets a pathId unless it's attached to a vector
    store.dispatch(startTextEdit({ box: { ...CIRCLE_BOX, pathId: undefined }, content: 'Hi' }));

    const canvas = createCanvas();

    // before — bottom of the ellipse is a quarter turn from the right edge (offset 0)
    continueEditingPathOffsetDrag(canvas, pointerEvent(BOTTOM.x, BOTTOM.y), store.dispatch);

    // result
    expect(store.getState().design.editingTextBox).toMatchObject({ pathStartOffset: expect.closeTo(0.25, 2) });
  });

  it('should update both the committed node and the editing box when a node already exists', () => {
    // mock
    store.dispatch(
      addNode({
        content: 'Hi',
        fill: '#ffffff',
        flipX: false,
        flipY: false,
        fontFamily: 'Inter',
        fontSize: 14,
        height: CIRCLE_BOX.height,
        name: 'Text',
        parentId: null,
        pathFlip: false,
        pathId: 'ellipse-1',
        pathStartOffset: 0,
        rotation: 0,
        type: NodeType.text,
        width: CIRCLE_BOX.width,
        x: CIRCLE_BOX.x,
        y: CIRCLE_BOX.y,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const nodeId = rootOrder[rootOrder.length - 1];

    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi', id: nodeId }));

    const canvas = createCanvas();

    // before
    continueEditingPathOffsetDrag(canvas, pointerEvent(BOTTOM.x, BOTTOM.y), store.dispatch);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId]).toMatchObject({
      pathStartOffset: expect.closeTo(0.25, 2),
    });
    expect(store.getState().design.editingTextBox).toMatchObject({ pathStartOffset: expect.closeTo(0.25, 2) });
  });
});
