// store
import { beginHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';
import { TSpacingAxis } from '../../../types';

// utils
import { startSpacingDrag } from '../startSpacingDrag';

const makeRectangle = (id: string, x: number, y: number, size = 20): TRectangleNode => ({
  fills: [],
  height: size,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: size,
  x,
  y,
});

describe('startSpacingDrag', () => {
  it('should remember the group order on both axes and open a history gesture', () => {
    // mock
    const dispatch = vi.fn();
    const orderRef = { current: { horizontal: [], vertical: [] } as Record<TSpacingAxis, string[][]> };
    const items = [makeRectangle('b', 60, 0), makeRectangle('a', 0, 40)];

    // before
    startSpacingDrag(dispatch, items, orderRef);

    // result
    expect(orderRef.current).toEqual({ horizontal: [['a'], ['b']], vertical: [['b'], ['a']] });
    expect(dispatch).toHaveBeenCalledWith(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
  });
});
