// store
import { addNode, deleteNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { resolveDistanceGuides } from '../resolveDistanceGuides';

const addRect = (x: number, y: number, width = 100, height = 100): string => {
  store.dispatch(addNode({ fill: '#000', height, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const canvasRefs = (hoveredId: string | null): TCanvasRefs =>
  ({ hover: { hoverRef: { current: hoveredId } }, transform: { distanceGuidesRef: { current: null } } }) as unknown as TCanvasRefs;

const pointerEvent = (altKey = true): PointerEvent => new PointerEvent('pointermove', { altKey });

describe('resolveDistanceGuides', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setSelection([]));
  });

  it('should populate the ref and switch the cursor class while Alt-hovering another node with one selected', () => {
    // mock
    const activeId = addRect(0, 0);
    const hoveredId = addRect(150, 20, 80, 60);

    store.dispatch(setSelection([activeId]));

    const refs = canvasRefs(hoveredId);
    const setClassName = vi.fn();

    // action
    resolveDistanceGuides(pointerEvent(), ToolName.default, refs, setClassName);

    // result
    expect(refs.transform.distanceGuidesRef.current).not.toBeNull();
    expect(setClassName).toHaveBeenCalledWith('distance-measure');
  });

  it('should clear the ref and leave the cursor class alone when Alt is not held', () => {
    // mock
    const activeId = addRect(0, 0);
    const hoveredId = addRect(150, 20, 80, 60);

    store.dispatch(setSelection([activeId]));

    const refs = canvasRefs(hoveredId);
    const setClassName = vi.fn();

    // action
    resolveDistanceGuides(pointerEvent(false), ToolName.default, refs, setClassName);

    // result
    expect(refs.transform.distanceGuidesRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the ref when nothing is selected', () => {
    // mock
    const hoveredId = addRect(150, 20, 80, 60);
    const refs = canvasRefs(hoveredId);

    // action
    resolveDistanceGuides(pointerEvent(), ToolName.default, refs, vi.fn());

    // result
    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should clear the ref when nothing is hovered', () => {
    // mock
    const activeId = addRect(0, 0);

    store.dispatch(setSelection([activeId]));

    const refs = canvasRefs(null);

    // action
    resolveDistanceGuides(pointerEvent(), ToolName.default, refs, vi.fn());

    // result
    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should clear the ref when the hovered node is part of the selection', () => {
    // mock
    const activeId = addRect(0, 0);

    store.dispatch(setSelection([activeId]));

    const refs = canvasRefs(activeId);

    // action
    resolveDistanceGuides(pointerEvent(), ToolName.default, refs, vi.fn());

    // result
    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should clear the ref when the hovered node id no longer resolves to a node', () => {
    // mock
    const activeId = addRect(0, 0);

    store.dispatch(setSelection([activeId]));

    const refs = canvasRefs('deleted-id');

    // action
    resolveDistanceGuides(pointerEvent(), ToolName.default, refs, vi.fn());

    // result
    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should clear the ref when a non-default tool is active', () => {
    // mock
    const activeId = addRect(0, 0);
    const hoveredId = addRect(150, 20, 80, 60);

    store.dispatch(setSelection([activeId]));

    const refs = canvasRefs(hoveredId);

    // action
    resolveDistanceGuides(pointerEvent(), ToolName.frame, refs, vi.fn());

    // result
    expect(refs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should use the union bounds of a multi-node selection as the active rect', () => {
    // mock — the target matches the union's own top/bottom (0..150), so no side insets kick in
    const a = addRect(0, 0, 50, 50);
    const b = addRect(0, 100, 50, 50);
    const hoveredId = addRect(200, 0, 50, 150);

    store.dispatch(setSelection([a, b]));

    const refs = canvasRefs(hoveredId);

    // action
    resolveDistanceGuides(pointerEvent(), ToolName.default, refs, vi.fn());

    // result — union bounds span y 0..150, so the horizontal gap band sits mid that overlap
    expect(refs.transform.distanceGuidesRef.current?.lines).toEqual([{ dashed: false, x1: 50, x2: 200, y1: 75, y2: 75 }]);
  });
});
