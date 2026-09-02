// store
import { addNode, deleteNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { updateNudgeDistanceGuide } from '../updateNudgeDistanceGuide';

const addRect = (x: number, y: number, width = 20, height = 20): string => {
  store.dispatch(addNode({ fill: '#000', height, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('updateNudgeDistanceGuide', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setSelection([]));
  });

  it('should populate the ref against the hovered node when Alt is held', () => {
    // mock
    const selectedId = addRect(0, 0);
    const hoveredId = addRect(50, 0);

    store.dispatch(setSelection([selectedId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.hover.hoverRef.current = hoveredId;

    // action
    updateNudgeDistanceGuide(store.getState(), canvasRefs, true);

    // result
    expect(canvasRefs.transform.distanceGuidesRef.current?.lines).toEqual([{ dashed: false, x1: 20, x2: 50, y1: 10, y2: 10 }]);
  });

  it('should leave the ref untouched when Alt is not held', () => {
    // mock
    const selectedId = addRect(0, 0);
    const hoveredId = addRect(50, 0);

    store.dispatch(setSelection([selectedId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.hover.hoverRef.current = hoveredId;

    // action
    updateNudgeDistanceGuide(store.getState(), canvasRefs, false);

    // result
    expect(canvasRefs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should leave the ref untouched when nothing is selected', () => {
    // mock
    const hoveredId = addRect(50, 0);
    const canvasRefs = createCanvasRefs();

    canvasRefs.hover.hoverRef.current = hoveredId;

    // action
    updateNudgeDistanceGuide(store.getState(), canvasRefs, true);

    // result
    expect(canvasRefs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should leave the ref untouched when nothing is hovered', () => {
    // mock
    const selectedId = addRect(0, 0);

    store.dispatch(setSelection([selectedId]));

    const canvasRefs = createCanvasRefs();

    // action
    updateNudgeDistanceGuide(store.getState(), canvasRefs, true);

    // result
    expect(canvasRefs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should leave the ref untouched when the hovered node is part of the selection', () => {
    // mock
    const selectedId = addRect(0, 0);
    const canvasRefs = createCanvasRefs();

    store.dispatch(setSelection([selectedId]));
    canvasRefs.hover.hoverRef.current = selectedId;

    // action
    updateNudgeDistanceGuide(store.getState(), canvasRefs, true);

    // result
    expect(canvasRefs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should use the union bounds of a multi-node selection', () => {
    // mock — two 20x20 rects stacked, union spans y 0..40
    const a = addRect(0, 0);
    const b = addRect(0, 20);
    const hoveredId = addRect(50, 0, 20, 40);

    store.dispatch(setSelection([a, b]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.hover.hoverRef.current = hoveredId;

    // action
    updateNudgeDistanceGuide(store.getState(), canvasRefs, true);

    // result — union bounds (0,0,20,40) fully vertically overlaps the target (50,0,20,40)
    expect(canvasRefs.transform.distanceGuidesRef.current?.lines).toEqual([{ dashed: false, x1: 20, x2: 50, y1: 20, y2: 20 }]);
  });
});
