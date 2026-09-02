// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { handleNudgeSelection } from '../handleNudgeSelection';

const addFrameNode = (x: number, y: number): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handleNudgeSelection', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should shift every selected node by the given delta', () => {
    // mock
    const frameId = addFrameNode(10, 10);

    store.dispatch(setSelection([frameId]));

    // action
    handleNudgeSelection(store.dispatch, createCanvasRefs(), -1, 10);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[frameId]).toMatchObject({ x: 9, y: 20 });
  });

  it('should update the distance guide against the currently hovered node when nudged with Alt held', () => {
    // mock — a nudged 20x20 frame and an unrelated 20x20 target 30px to its right
    const frameId = addFrameNode(0, 0);
    const targetId = addFrameNode(50, 0);

    store.dispatch(setSelection([frameId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.hover.hoverRef.current = targetId;

    // action — nudge right by 1, closing the gap from 30 to 29
    handleNudgeSelection(store.dispatch, canvasRefs, 1, 0, true);

    // result
    expect(canvasRefs.transform.distanceGuidesRef.current?.lines).toEqual([{ dashed: false, x1: 21, x2: 50, y1: 10, y2: 10 }]);
  });

  it('should not touch the distance guide ref when nudged without Alt held', () => {
    // mock
    const frameId = addFrameNode(0, 0);
    const targetId = addFrameNode(50, 0);

    store.dispatch(setSelection([frameId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.hover.hoverRef.current = targetId;

    // action
    handleNudgeSelection(store.dispatch, canvasRefs, 1, 0);

    // result
    expect(canvasRefs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should be undoable as a single step even with multiple selected nodes', () => {
    // mock
    const frameIdA = addFrameNode(0, 0);
    const frameIdB = addFrameNode(100, 100);

    store.dispatch(setSelection([frameIdA, frameIdB]));

    // action
    handleNudgeSelection(store.dispatch, createCanvasRefs(), 1, 1);
    store.dispatch(undo());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[frameIdA]).toMatchObject({ x: 0, y: 0 });
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[frameIdB]).toMatchObject({ x: 100, y: 100 });
  });

  it('should do nothing when nothing is selected', () => {
    // mock
    const frameId = addFrameNode(10, 10);

    // action
    handleNudgeSelection(store.dispatch, createCanvasRefs(), 1, 1);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[frameId]).toMatchObject({ x: 10, y: 10 });
  });

  it('should do nothing while a vector node is open for editing', () => {
    // mock
    const frameId = addFrameNode(10, 10);

    store.dispatch(setSelection([frameId]));
    store.dispatch(setVectorEditingNodeIds([frameId]));

    // action
    handleNudgeSelection(store.dispatch, createCanvasRefs(), 1, 1);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[frameId]).toMatchObject({ x: 10, y: 10 });
  });
});
