// store
import { deleteNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TFlattenEntry } from '../types';

// utils
import { deleteFlattenedTextPaths } from '../deleteFlattenedTextPaths';

const entry = (node: object): TFlattenEntry => ({ node, renderIndex: 0, vector: {} }) as unknown as TFlattenEntry;

describe('deleteFlattenedTextPaths', () => {
  it('should delete the path of every flattened text that sat on one', () => {
    // mock
    const dispatch = vi.fn();

    // before
    deleteFlattenedTextPaths(dispatch, [
      entry({ id: 't1', pathId: 'path-1', type: NodeType.text }),
      entry({ id: 't2', pathId: null, type: NodeType.text }),
      entry({ id: 'r', type: NodeType.rectangle }),
    ]);

    // result
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(deleteNode('path-1'));
  });
});
