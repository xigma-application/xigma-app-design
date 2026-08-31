// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getShapeOutlineTargets } from '../getShapeOutlineTargets';

const addSelectedNode = (node: Parameters<typeof addNode>[0]): string => {
  store.dispatch(addNode(node));
  const [id] = selectActivePage(store.getState()).rootOrder.slice(-1);
  store.dispatch(setSelection([id]));

  return id;
};

describe('getShapeOutlineTargets', () => {
  it('should return one outline target per selected strokeable shape', () => {
    // mock
    const rectId = addSelectedNode({
      fill: '#ff0000',
      height: 20,
      name: 'Rect',
      parentId: null,
      rotation: 0,
      strokeColor: '#000000',
      strokeWidth: 4,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
    });

    // action
    const targets = getShapeOutlineTargets();

    // result
    expect(targets).toHaveLength(1);
    expect(targets[0].node.id).toBe(rectId);
    expect(targets[0].outline.type).toBe(NodeType.vector);
  });

  it('should drop a selected strokeable shape whose stroke yields no outline', () => {
    // mock — a rectangle with no stroke set
    addSelectedNode({
      fill: '#ff0000',
      height: 20,
      name: 'Rect',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
    });

    // action
    const targets = getShapeOutlineTargets();

    // result
    expect(targets).toEqual([]);
  });

  it('should ignore selected nodes that are not strokeable at all', () => {
    // mock
    addSelectedNode({
      fill: '#ffffff',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    });

    // action
    const targets = getShapeOutlineTargets();

    // result
    expect(targets).toEqual([]);
  });
});
