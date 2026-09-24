// types
import { TFlattenEntry } from '../types';

// utils
import { getFlattenEntryGroups } from '../getFlattenEntryGroups';

const makeEntry = (id: string, parentId: string | null, renderIndex: number): TFlattenEntry =>
  ({ node: { id, parentId }, renderIndex, vector: {} }) as unknown as TFlattenEntry;

describe('getFlattenEntryGroups', () => {
  it('should split the entries by parent keeping their render order', () => {
    // mock
    const entries = [makeEntry('a', null, 0), makeEntry('b', 'frame', 1), makeEntry('c', null, 2)];

    // action / result
    expect(getFlattenEntryGroups(entries).map((group) => group.map(({ node }) => node.id))).toEqual([['a', 'c'], ['b']]);
  });
});
