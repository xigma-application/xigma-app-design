// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage, selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { handleResizeToFit } from '../handleResizeToFit';

const addRectangleNode = (overrides: Partial<TRectangleNode> = {}): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 20,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addFrameNode = (overrides: Partial<TFrameNode> = {}): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 200,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 200,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handleResizeToFit', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when nothing is selected', () => {
    // mock
    const before = selectNodes(store.getState());

    // action
    handleResizeToFit(store.dispatch);

    // result
    expect(selectNodes(store.getState())).toEqual(before);
  });

  it('should do nothing when the selected node is not a frame', () => {
    // mock
    const id = addRectangleNode();
    store.dispatch(setSelection([id]));
    const before = selectNodes(store.getState())[id];

    // action
    handleResizeToFit(store.dispatch);

    // result
    expect(selectNodes(store.getState())[id]).toEqual(before);
  });

  it('should do nothing when more than one node is selected', () => {
    // mock
    const idA = addFrameNode({ childIds: [] });
    const idB = addFrameNode({ childIds: [] });
    store.dispatch(setSelection([idA, idB]));
    const before = selectNodes(store.getState())[idA];

    // action
    handleResizeToFit(store.dispatch);

    // result
    expect(selectNodes(store.getState())[idA]).toEqual(before);
  });

  it('should do nothing when the selected frame has no children', () => {
    // mock
    const id = addFrameNode({ childIds: [] });
    store.dispatch(setSelection([id]));
    const before = selectNodes(store.getState())[id];

    // action
    handleResizeToFit(store.dispatch);

    // result
    expect(selectNodes(store.getState())[id]).toEqual(before);
  });

  it('should shrink the frame to the outermost bounds of its children', () => {
    // mock — frame at 0,0 200x200, two children at 10,10-30,30 and 60,60-90,110
    const childA = addRectangleNode({ height: 20, width: 20, x: 10, y: 10 });
    const childB = addRectangleNode({ height: 50, width: 30, x: 60, y: 60 });
    const frameId = addFrameNode({ childIds: [childA, childB], height: 200, width: 200, x: 0, y: 0 });
    store.dispatch(setSelection([frameId]));

    // action
    handleResizeToFit(store.dispatch);

    // result — bounds wrap [10,10] to [90,110]
    const frame = selectNodes(store.getState())[frameId] as TFrameNode;
    expect(frame.x).toBe(10);
    expect(frame.y).toBe(10);
    expect(frame.width).toBe(80);
    expect(frame.height).toBe(100);
  });

  it('should grow the frame when children extend past its current bounds', () => {
    // mock — frame at 0,0 20x20, a child far outside it
    const childId = addRectangleNode({ height: 40, width: 40, x: 100, y: 100 });
    const frameId = addFrameNode({ childIds: [childId], height: 20, width: 20, x: 0, y: 0 });
    store.dispatch(setSelection([frameId]));

    // action
    handleResizeToFit(store.dispatch);

    // result
    const frame = selectNodes(store.getState())[frameId] as TFrameNode;
    expect(frame.x).toBe(100);
    expect(frame.y).toBe(100);
    expect(frame.width).toBe(40);
    expect(frame.height).toBe(40);
  });

  it('should skip a childId that no longer resolves to a node', () => {
    // mock
    const childId = addRectangleNode({ height: 20, width: 20, x: 10, y: 10 });
    const frameId = addFrameNode({ childIds: [childId, 'missing'], height: 200, width: 200, x: 0, y: 0 });
    store.dispatch(setSelection([frameId]));

    // action
    handleResizeToFit(store.dispatch);

    // result
    const frame = selectNodes(store.getState())[frameId] as TFrameNode;
    expect(frame.width).toBe(20);
    expect(frame.height).toBe(20);
  });
});
