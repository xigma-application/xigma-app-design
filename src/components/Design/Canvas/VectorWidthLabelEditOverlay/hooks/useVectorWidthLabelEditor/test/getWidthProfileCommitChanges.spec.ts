// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TVectorWidthLabelEdit } from '../types';

// utils
import { getWidthProfileCommitChanges } from '../getWidthProfileCommitChanges';

const edit = { nodeId: 'v', pointId: 'p1', value: 4 } as TVectorWidthLabelEdit;
const nodes = {
  plain: { id: 'plain', type: NodeType.vector },
  r: { id: 'r', type: NodeType.rectangle },
  v: {
    id: 'v',
    type: NodeType.vector,
    widthProfile: { points: { p1: { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 2 }, p2: { id: 'p2' } } },
  },
} as unknown as Record<string, TSceneNode>;

describe('getWidthProfileCommitChanges', () => {
  it('should split the typed width evenly across both sides of the width point', () => {
    // result
    expect(getWidthProfileCommitChanges(edit, ' 10 ', nodes)).toEqual({
      changes: { widthProfile: { points: { p1: { id: 'p1', leftOffset: 5, position: 0.5, rightOffset: 5 }, p2: { id: 'p2' } } } },
      id: 'v',
    });
  });

  it('should ignore empty, invalid, negative or unchanged widths', () => {
    // result
    ['', 'abc', '-1', '4', 'Infinity'].forEach((raw) => expect(getWidthProfileCommitChanges(edit, raw, nodes)).toBeNull());
  });

  it('should ignore a missing, non-vector or profile-less node and a missing point', () => {
    // result
    expect(getWidthProfileCommitChanges({ ...edit, nodeId: 'missing' }, '10', nodes)).toBeNull();
    expect(getWidthProfileCommitChanges({ ...edit, nodeId: 'r' }, '10', nodes)).toBeNull();
    expect(getWidthProfileCommitChanges({ ...edit, nodeId: 'plain' }, '10', nodes)).toBeNull();
    expect(getWidthProfileCommitChanges({ ...edit, pointId: 'p3' }, '10', nodes)).toBeNull();
  });
});
