// store
import { deleteNode, replaceNode } from 'store/design/slice';

// types
import { TFlattenEntry } from '../types';
import { TVectorNode } from 'types/design/types';

// utils
import { flattenEntries } from '../flattenEntries';

const singleMock = vi.fn();

vi.mock('../getMergedFlattenVector', () => ({ getMergedFlattenVector: (): unknown => ({ id: 'top', merged: true }) }));
vi.mock('../getSingleFlattenVector', () => ({ getSingleFlattenVector: (...args: unknown[]): unknown => singleMock(...args) }));

const entry = (id: string): TFlattenEntry => ({ node: { id }, renderIndex: 0, vector: {} }) as unknown as TFlattenEntry;

describe('flattenEntries', () => {
  it('should merge several entries into the topmost one and delete the rest', () => {
    // mock
    const dispatch = vi.fn();

    // before
    flattenEntries(dispatch, [entry('a'), entry('b'), entry('top')]);

    // result
    expect(dispatch.mock.calls.map(([action]) => action)).toEqual([
      deleteNode('a'),
      deleteNode('b'),
      replaceNode({ id: 'top', node: { id: 'top', merged: true } as unknown as TVectorNode }),
    ]);
  });

  it('should replace a single entry with its vector under the same id', () => {
    // mock
    const dispatch = vi.fn();
    singleMock.mockReturnValue({ id: 'other', name: 'Vector' });

    // before
    flattenEntries(dispatch, [entry('only')]);

    // result
    expect(dispatch).toHaveBeenCalledWith(replaceNode({ id: 'only', node: { id: 'only', name: 'Vector' } as unknown as TVectorNode }));
  });

  it('should leave a single entry that is already a vector alone', () => {
    // mock
    const dispatch = vi.fn();
    singleMock.mockReturnValue(null);

    // before
    flattenEntries(dispatch, [entry('vector')]);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
