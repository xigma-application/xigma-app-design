// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

// types
import { AlignmentHorizontal, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { alignSelectionGroups } from '../alignSelectionGroups';

const alignMock = vi.fn();

vi.mock('../alignNodeToRect', () => ({ alignNodeToRect: (...args: unknown[]): unknown => alignMock(...args) }));

const makeRectangle = (id: string, x: number, y: number, width = 20, parentId: string | null = null): TRectangleNode => ({
  fills: [],
  height: 20,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width,
  x,
  y,
});

describe('alignSelectionGroups', () => {
  it('should align every group to its own bounds inside one history gesture', () => {
    // mock
    const dispatch = vi.fn();
    const a = makeRectangle('a', 0, 0);
    const b = makeRectangle('b', 40, 10);
    const next = { horizontal: AlignmentHorizontal.left };

    // before
    alignSelectionGroups(dispatch, { a, b }, [[a, b]], next);

    // result
    expect(dispatch.mock.calls).toEqual([[beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)], [endHistoryGesture()]]);
    expect(alignMock).toHaveBeenCalledWith(dispatch, { a, b }, a, { height: 30, width: 60, x: 0, y: 0 }, next);
    expect(alignMock).toHaveBeenCalledWith(dispatch, { a, b }, b, { height: 30, width: 60, x: 0, y: 0 }, next);
  });
});
