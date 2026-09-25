// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TTextNode, TVectorNode } from 'types/design/types';

// utils
import { getFlattenEntries } from '../getFlattenEntries';

vi.mock('utils/canvas/flatten/getFlattenOperandVector', () => ({
  getFlattenOperandVector: (node: { id: string }): unknown => (node.id === 'flat-skip' ? null : { id: `vector-${node.id}` }),
}));

const rectangle = (id: string): TRectangleNode => ({
  fills: [],
  height: 10,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

describe('getFlattenEntries', () => {
  it('should pair every flattenable selected layer and text target with its vector, in render order, unrendered ones first', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [rectangle('flat-a'), rectangle('flat-skip'), rectangle('flat-b'), rectangle('flat-orphan')],
        rootIds: ['flat-a', 'flat-skip', 'flat-b'],
      }),
    );
    store.dispatch(setSelection(['flat-b', 'flat-skip', 'flat-a', 'flat-orphan']));
    const text = { id: 'flat-text' } as TTextNode;
    const textVector = { id: 'text-vector' } as TVectorNode;

    // before
    const entries = getFlattenEntries([{ node: text, vector: textVector }]);

    // result
    expect(entries.map(({ node, vector }) => [node.id, vector.id])).toEqual([
      ['flat-a', 'vector-flat-a'],
      ['flat-orphan', 'vector-flat-orphan'],
      ['flat-text', 'text-vector'],
      ['flat-b', 'vector-flat-b'],
    ]);

    // cleanup
    store.dispatch(setSelection([]));
  });
});
