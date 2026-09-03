// store
import { addNode, deleteNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getAspectRatioLockGuide } from '../getAspectRatioLockGuide';

const addFrameNode = (x: number, y: number, width: number, height: number, rotation = 0): string => {
  store.dispatch(addNode({ fill: '#ff0000', height, name: 'Frame', parentId: null, rotation, childIds: [], clipContent: true, type: NodeType.frame, width, x, y }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const BOX_ORIGIN = { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 };
const VECTOR_ORIGIN = { rotation: 0, segments: {}, vertices: {} };

describe('getAspectRatioLockGuide', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should return null when the resize is not aspect-locked', () => {
    // before
    const nodeId = addFrameNode(0, 0, 100, 50);

    // result
    expect(getAspectRatioLockGuide(false, BOX_ORIGIN, nodeId)).toBeNull();
  });

  it('should return null when there is no single rotatable origin (a multi-node resize)', () => {
    // result
    expect(getAspectRatioLockGuide(true, null, 'some-id')).toBeNull();
  });

  it('should return null when the single origin is a vector node, which has no width to lock against', () => {
    // result
    expect(getAspectRatioLockGuide(true, VECTOR_ORIGIN, 'some-id')).toBeNull();
  });

  it('should return null when there is no node id (a rotated-group resize with no single box origin)', () => {
    // result
    expect(getAspectRatioLockGuide(true, BOX_ORIGIN, undefined)).toBeNull();
  });

  it('should return null when the node no longer resolves in the store', () => {
    // result
    expect(getAspectRatioLockGuide(true, BOX_ORIGIN, 'missing-id')).toBeNull();
  });

  it("should return the live node's current geometry, not the frozen drag-start origin", () => {
    // before
    const nodeId = addFrameNode(0, 0, 100, 50, 30);

    // result — reads the node fresh from the store, independent of what BOX_ORIGIN itself says
    expect(getAspectRatioLockGuide(true, BOX_ORIGIN, nodeId)).toEqual({ height: 50, rotation: 30, width: 100, x: 0, y: 0 });
  });
});
