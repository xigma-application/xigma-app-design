// store
import { addNode, deleteNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { resolveEqualSpacingGuides } from '../resolveEqualSpacingGuides';

const addRect = (x: number, y: number, width = 100, height = 100, overrides: Record<string, unknown> = {}): string => {
  store.dispatch(
    addNode({ fill: '#000', height, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y, ...overrides }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const canvasRefs = (): TCanvasRefs => ({ transform: { equalSpacingGuidesRef: { current: null } } }) as unknown as TCanvasRefs;

const selectionRefs = (overrides: Partial<TSelectionToolRefs> = {}): TSelectionToolRefs =>
  ({ dragStateRef: { current: null }, resizeDragRef: { current: null }, ...overrides }) as unknown as TSelectionToolRefs;

const pointerEvent = (altKey = false): PointerEvent => new PointerEvent('pointermove', { altKey });

// three rectangles 20px apart on both sides of the active one
const buildEqualSpacingScene = (): string => {
  const activeId = addRect(100, 100);

  addRect(0, 100, 80, 100);
  addRect(220, 100, 50, 100);

  return activeId;
};

describe('resolveEqualSpacingGuides', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setSelection([]));
  });

  it('should do nothing while a drag has moved — continueDrag.ts owns that case', () => {
    // mock
    const activeId = buildEqualSpacingScene();
    const refs = canvasRefs();

    refs.transform.equalSpacingGuidesRef.current = { labels: [], lines: [{ dashed: false, x1: 1, x2: 1, y1: 1, y2: 1 }] };

    // action
    resolveEqualSpacingGuides(
      pointerEvent(),
      refs,
      selectionRefs({ dragStateRef: { current: { hasMoved: true, nodeOrigins: { [activeId]: {} } } } } as never),
    );

    // result — left untouched, whatever continueDrag already wrote stays
    expect(refs.transform.equalSpacingGuidesRef.current).toEqual({ labels: [], lines: [{ dashed: false, x1: 1, x2: 1, y1: 1, y2: 1 }] });
  });

  it('should populate the ref while a single shape is being resized into an equal-spacing pattern', () => {
    // mock
    const activeId = buildEqualSpacingScene();
    const refs = canvasRefs();

    // action
    resolveEqualSpacingGuides(
      pointerEvent(),
      refs,
      selectionRefs({ resizeDragRef: { current: { nodeOrigins: { [activeId]: {} } } } } as never),
    );

    // result
    expect(refs.transform.equalSpacingGuidesRef.current?.lines).toHaveLength(2);
    expect(refs.transform.equalSpacingGuidesRef.current?.labels.every((label) => label.text === '20')).toBe(true);
  });

  it('should populate the ref for the single selected shape while Alt is held', () => {
    // mock
    const activeId = buildEqualSpacingScene();

    store.dispatch(setSelection([activeId]));

    const refs = canvasRefs();

    // action
    resolveEqualSpacingGuides(pointerEvent(true), refs, selectionRefs());

    // result
    expect(refs.transform.equalSpacingGuidesRef.current?.lines).toHaveLength(2);
  });

  it('should clear the ref when nothing is dragged, resized, or Alt-hovered', () => {
    // mock
    buildEqualSpacingScene();

    const refs = canvasRefs();

    refs.transform.equalSpacingGuidesRef.current = { labels: [], lines: [{ dashed: false, x1: 1, x2: 1, y1: 1, y2: 1 }] };

    // action
    resolveEqualSpacingGuides(pointerEvent(), refs, selectionRefs());

    // result
    expect(refs.transform.equalSpacingGuidesRef.current).toBeNull();
  });

  it('should clear the ref when the gaps do not actually match', () => {
    // mock — right neighbor sits farther away than the left one
    const activeId = addRect(100, 100);

    addRect(0, 100, 80, 100);
    addRect(260, 100, 50, 100);

    const refs = canvasRefs();

    // action
    resolveEqualSpacingGuides(
      pointerEvent(),
      refs,
      selectionRefs({ resizeDragRef: { current: { nodeOrigins: { [activeId]: {} } } } } as never),
    );

    // result
    expect(refs.transform.equalSpacingGuidesRef.current).toBeNull();
  });

  it('should not consider a rotated-off-grid active shape', () => {
    // mock
    const activeId = addRect(100, 100, 100, 100, { rotation: 30 });

    addRect(0, 100, 80, 100);
    addRect(220, 100, 50, 100);

    const refs = canvasRefs();

    // action
    resolveEqualSpacingGuides(
      pointerEvent(),
      refs,
      selectionRefs({ resizeDragRef: { current: { nodeOrigins: { [activeId]: {} } } } } as never),
    );

    // result
    expect(refs.transform.equalSpacingGuidesRef.current).toBeNull();
  });

  it('should skip non-shape neighbours such as groups', () => {
    // mock
    const activeId = addRect(100, 100);

    addRect(0, 100, 80, 100, { childIds: [], type: NodeType.group });
    addRect(220, 100, 50, 100, { childIds: [], type: NodeType.group });

    const refs = canvasRefs();

    // action
    resolveEqualSpacingGuides(
      pointerEvent(),
      refs,
      selectionRefs({ resizeDragRef: { current: { nodeOrigins: { [activeId]: {} } } } } as never),
    );

    // result
    expect(refs.transform.equalSpacingGuidesRef.current).toBeNull();
  });
});
