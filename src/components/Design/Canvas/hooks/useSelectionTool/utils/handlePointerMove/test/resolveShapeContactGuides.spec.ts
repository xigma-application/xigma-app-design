// store
import { addNode, deleteNode, setSelection } from 'store/design/slice';
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

  it('should not show a guide on Alt-hover when more than one shape is selected', () => {
    // mock
    const a = addRect(0, 0);
    const b = addRect(100, 0, 40, 40);

    store.dispatch(setSelection([a, b]));

    const refs = canvasRefs();

    // action
    resolveShapeContactGuides(pointerEvent(true), refs, selectionRefs());

    // result
    expect(refs.transform.contactGuidesRef.current).toBeNull();
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

  it('should ignore a drag that moves more than one node at once', () => {
    // mock
    const a = addRect(0, 0);
    const b = addRect(100, 0, 40, 40);

    const refs = canvasRefs();

    // action
    resolveShapeContactGuides(
      pointerEvent(),
      refs,
      selectionRefs({ dragStateRef: { current: { hasMoved: true, nodeOrigins: { [a]: {}, [b]: {} } } } } as never),
    );

    // result
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
