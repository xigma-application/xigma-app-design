// store
import { addNode, deleteNode, moveNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { resolveShapeContactGuides } from '../resolveShapeContactGuides';

const addRect = (x: number, y: number, width = 100, height = 100, overrides: Record<string, unknown> = {}): string => {
  store.dispatch(
    addNode({ fill: '#000', height, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y, ...overrides }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const canvasRefs = (): TCanvasRefs => ({ transform: { contactGuidesRef: { current: null } } }) as unknown as TCanvasRefs;

const selectionRefs = (overrides: Partial<TSelectionToolRefs> = {}): TSelectionToolRefs =>
  ({ dragStateRef: { current: null }, resizeDragRef: { current: null }, ...overrides }) as unknown as TSelectionToolRefs;

const pointerEvent = (altKey = false): PointerEvent => new PointerEvent('pointermove', { altKey });

describe('resolveShapeContactGuides', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setSelection([]));
  });

  it('should populate the ref with a guide while a single shape is being dragged flush against another', () => {
    // mock
    const activeId = addRect(0, 0);

    addRect(100, 20, 80, 60);

    const refs = canvasRefs();

    // action
    resolveShapeContactGuides(
      pointerEvent(),
      refs,
      selectionRefs({ dragStateRef: { current: { hasMoved: true, nodeOrigins: { [activeId]: {} } } } } as never),
    );

    // result — a line on each shape's own edge
    expect(refs.transform.contactGuidesRef.current).toEqual([
      { x1: 100, x2: 100, y1: 0, y2: 100 },
      { x1: 100, x2: 100, y1: 20, y2: 80 },
    ]);
  });

  it('should populate the ref while a single shape is being resized into contact', () => {
    // mock
    const activeId = addRect(0, 0);

    addRect(0, 100, 40, 40);

    const refs = canvasRefs();

    // action
    resolveShapeContactGuides(
      pointerEvent(),
      refs,
      selectionRefs({ resizeDragRef: { current: { nodeOrigins: { [activeId]: {} } } } } as never),
    );

    // result
    expect(refs.transform.contactGuidesRef.current).toEqual([
      { x1: 0, x2: 100, y1: 100, y2: 100 },
      { x1: 0, x2: 40, y1: 100, y2: 100 },
    ]);
  });

  it('should populate the ref for every node in a multi-node resize — e.g. a resized group', () => {
    // mock — a and b are both being resized together, only a lands in contact with c
    const a = addRect(0, 0);
    const b = addRect(500, 500, 40, 40);

    addRect(0, 100, 40, 40);

    const refs = canvasRefs();

    // action
    resolveShapeContactGuides(
      pointerEvent(),
      refs,
      selectionRefs({ resizeDragRef: { current: { nodeOrigins: { [a]: {}, [b]: {} } } } } as never),
    );

    // result
    expect(refs.transform.contactGuidesRef.current).toEqual([
      { x1: 0, x2: 100, y1: 100, y2: 100 },
      { x1: 0, x2: 40, y1: 100, y2: 100 },
    ]);
  });

  it('should populate the ref for the single selected shape while Alt is held', () => {
    // mock
    const activeId = addRect(0, 0);

    addRect(100, 0, 40, 40);
    store.dispatch(setSelection([activeId]));

    const refs = canvasRefs();

    // action
    resolveShapeContactGuides(pointerEvent(true), refs, selectionRefs());

    // result
    expect(refs.transform.contactGuidesRef.current).toEqual([
      { x1: 100, x2: 100, y1: 0, y2: 100 },
      { x1: 100, x2: 100, y1: 0, y2: 40 },
    ]);
  });

  it('should show a guide for each selected shape when Alt-hovering multiple selected shapes — e.g. a whole group', () => {
    // mock — a and b are both selected (as if a group's children), b is nowhere near anything;
    // c is a third, unselected shape flush against a's right edge
    const a = addRect(0, 0);
    const b = addRect(500, 500, 40, 40);

    addRect(100, 20, 80, 60);
    store.dispatch(setSelection([a, b]));

    const refs = canvasRefs();

    // action
    resolveShapeContactGuides(pointerEvent(true), refs, selectionRefs());

    // result — only a's contact with c shows; b contributes nothing since it touches nothing
    expect(refs.transform.contactGuidesRef.current).toEqual([
      { x1: 100, x2: 100, y1: 0, y2: 100 },
      { x1: 100, x2: 100, y1: 20, y2: 80 },
    ]);
  });

  it('should clear the ref when nothing is dragged, resized, or Alt-hovered', () => {
    // mock
    addRect(0, 0);
    addRect(100, 0, 40, 40);

    const refs = canvasRefs();

    refs.transform.contactGuidesRef.current = [{ x1: 1, x2: 1, y1: 1, y2: 1 }];

    // action
    resolveShapeContactGuides(pointerEvent(), refs, selectionRefs());

    // result
    expect(refs.transform.contactGuidesRef.current).toBeNull();
  });

  it('should show a guide for each node in a multi-node drag — e.g. a moved group — against stationary shapes, but never between the dragged nodes themselves', () => {
    // mock — a and b are dragged together (as if a group's children), b is nowhere near anything;
    // c is a third, stationary shape flush against a's right edge
    const a = addRect(0, 0);
    const b = addRect(500, 500, 40, 40);

    addRect(100, 20, 80, 60);

    const refs = canvasRefs();

    // action
    resolveShapeContactGuides(
      pointerEvent(),
      refs,
      selectionRefs({ dragStateRef: { current: { hasMoved: true, nodeOrigins: { [a]: {}, [b]: {} } } } } as never),
    );

    // result — only a's contact with c shows; a and b never collide with each other
    expect(refs.transform.contactGuidesRef.current).toEqual([
      { x1: 100, x2: 100, y1: 0, y2: 100 },
      { x1: 100, x2: 100, y1: 20, y2: 80 },
    ]);
  });

  it('should not draw contact guides between a resized frame and its own children', () => {
    // mock — a 200x200 frame with an 80x80 child; the child's bottom edge (y=100) would otherwise
    // register a contact guide against the frame's own geometry while the frame is resized
    const frameId = addRect(0, 0, 200, 200, { childIds: [], clipContent: true, type: NodeType.frame });
    const childId = addRect(20, 20, 80, 80);

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: frameId }));

    const refs = canvasRefs();

    // action — resize the frame
    resolveShapeContactGuides(
      pointerEvent(),
      refs,
      selectionRefs({ resizeDragRef: { current: { nodeOrigins: { [frameId]: {} } } } } as never),
    );

    // result — the frame's own child never produces a contact guide against it
    expect(refs.transform.contactGuidesRef.current).toBeNull();
  });

  it('should not consider a rotated-off-grid shape', () => {
    // mock
    const activeId = addRect(0, 0, 100, 100, { rotation: 30 });

    addRect(100, 0, 40, 40);

    const refs = canvasRefs();

    // action
    resolveShapeContactGuides(
      pointerEvent(),
      refs,
      selectionRefs({ dragStateRef: { current: { hasMoved: true, nodeOrigins: { [activeId]: {} } } } } as never),
    );

    // result
    expect(refs.transform.contactGuidesRef.current).toBeNull();
  });

  it('should skip non-shape neighbours such as groups', () => {
    // mock
    const activeId = addRect(0, 0);

    addRect(100, 20, 80, 60, { type: NodeType.group });

    const refs = canvasRefs();

    // action
    resolveShapeContactGuides(
      pointerEvent(),
      refs,
      selectionRefs({ dragStateRef: { current: { hasMoved: true, nodeOrigins: { [activeId]: {} } } } } as never),
    );

    // result
    expect(refs.transform.contactGuidesRef.current).toBeNull();
  });
});
