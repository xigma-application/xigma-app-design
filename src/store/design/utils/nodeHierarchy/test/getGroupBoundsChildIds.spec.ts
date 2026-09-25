// types
import { NodeType } from 'types/design/enums';
import { TGroupLikeNode } from 'types/design/types';

// utils
import { getGroupBoundsChildIds } from '../getGroupBoundsChildIds';

describe('getGroupBoundsChildIds', () => {
  it('should bound a mask by its mask shape only', () => {
    // result
    expect(getGroupBoundsChildIds({ childIds: ['a', 'b'], type: NodeType.mask } as TGroupLikeNode)).toEqual(['b']);
  });

  it('should bound a group by all its children', () => {
    // result
    expect(getGroupBoundsChildIds({ childIds: ['a', 'b'], type: NodeType.group } as TGroupLikeNode)).toEqual(['a', 'b']);
  });
});
