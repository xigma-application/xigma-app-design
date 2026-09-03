// store
import { addNode, groupNodes, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getGroupChildHitAtPoint } from '../getGroupChildHitAtPoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: size, x, y }),
  );

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

describe('getGroupChildHitAtPoint', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should return the individual child under the point, not the group', () => {
    // mock
    const idA = addFrameNode(0, 0);
    const idB = addFrameNode(100, 0);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());

    // action
    const hit = getGroupChildHitAtPoint({ x: 10, y: 10 }, IDENTITY_VIEWPORT);

    // result
    expect(hit?.id).toBe(idA);
  });

  it('should return null for a top-level node with no parent group', () => {
    // mock
    addFrameNode(0, 0);

    // action
    const hit = getGroupChildHitAtPoint({ x: 10, y: 10 }, IDENTITY_VIEWPORT);

    // result
    expect(hit).toBeNull();
  });

  it('should return null when nothing is hit', () => {
    // action
    const hit = getGroupChildHitAtPoint({ x: 9000, y: 9000 }, IDENTITY_VIEWPORT);

    // result
    expect(hit).toBeNull();
  });

  it('should return null for a child currently open in Vector Edit Mode', () => {
    // mock
    const idA = addFrameNode(0, 0);
    const idB = addFrameNode(100, 0);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    store.dispatch(setVectorEditingNodeIds([idA]));

    // action
    const hit = getGroupChildHitAtPoint({ x: 10, y: 10 }, IDENTITY_VIEWPORT);

    // result
    expect(hit).toBeNull();
  });
});
