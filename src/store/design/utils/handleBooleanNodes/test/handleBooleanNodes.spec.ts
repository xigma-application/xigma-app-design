// store
import { addNodes, booleanNodes, setSelection } from 'store/design/slice';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TBooleanNode, TFrameNode, TRectangleNode, TTextNode } from 'types/design/types';

const makeRectangle = (id: string, x: number, overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 40,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x,
  y: 10,
  ...overrides,
});

const frame: TFrameNode = {
  childIds: [],
  clipContent: false,
  fills: [],
  height: 40,
  id: 'frame',
  name: 'frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 40,
  x: 500,
  y: 0,
};

const text = {
  content: 'a',
  fill: '#000',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 12,
  height: 10,
  id: 'text',
  name: 'text',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 10,
  x: 600,
  y: 0,
} as TTextNode;

const getSelectedBoolean = (): TBooleanNode => selectNodes(store.getState())[selectSelectedIds(store.getState())[0]] as TBooleanNode;

beforeAll(() => {
  store.dispatch(
    addNodes({
      nodes: [
        makeRectangle('bottom', 0),
        makeRectangle('top', 20, {
          fills: [{ color: '#0000ff', opacity: 100, type: 'solid' }],
          strokeWidth: 2,
          strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
        }),
        makeRectangle('single', 200),
        frame,
        text,
      ],
      rootIds: ['bottom', 'top', 'single', 'frame', 'text'],
    }),
  );
});

describe('handleBooleanNodes', () => {
  it('should wrap the selection in a boolean node styled like its top layer', () => {
    // mock
    store.dispatch(setSelection(['bottom', 'top']));

    // action
    store.dispatch(booleanNodes(BooleanOperation.union));

    // result
    expect(getSelectedBoolean()).toMatchObject({
      booleanOperation: BooleanOperation.union,
      childIds: ['bottom', 'top'],
      fills: [{ color: '#0000ff', opacity: 100, type: 'solid' }],
      height: 40,
      name: 'Union',
      strokeWidth: 2,
      strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
      type: NodeType.boolean,
      width: 60,
      x: 0,
      y: 10,
    });
  });

  it('should only switch the operation and default name of a selected boolean', () => {
    // mock
    const { childIds, id } = getSelectedBoolean();

    // action
    store.dispatch(booleanNodes(BooleanOperation.exclude));

    // result
    expect(selectNodes(store.getState())[id]).toMatchObject({ booleanOperation: BooleanOperation.exclude, childIds, name: 'Exclude' });
  });

  it('should keep a custom name when switching the operation', () => {
    // mock
    const boolean = getSelectedBoolean();

    store.dispatch(addNodes({ nodes: [{ ...boolean, name: 'Logo' }], rootIds: [] }));

    // action
    store.dispatch(booleanNodes(BooleanOperation.intersect));

    // result
    expect(selectNodes(store.getState())[boolean.id]).toMatchObject({ booleanOperation: BooleanOperation.intersect, name: 'Logo' });
  });

  it('should create a boolean from a single shape', () => {
    // mock
    store.dispatch(setSelection(['single']));

    // action
    store.dispatch(booleanNodes(BooleanOperation.subtract));

    // result
    expect(getSelectedBoolean()).toMatchObject({ childIds: ['single'], name: 'Subtract', type: NodeType.boolean });
  });

  it.each([['frame'], ['text']])('should ignore a selection containing a %s', (id) => {
    // mock
    store.dispatch(setSelection([id]));

    // action
    store.dispatch(booleanNodes(BooleanOperation.union));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([id]);
    expect(selectNodes(store.getState())[id].parentId).toBeNull();
  });
});
