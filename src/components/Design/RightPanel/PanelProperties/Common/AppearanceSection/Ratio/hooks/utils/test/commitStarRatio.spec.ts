// store
import { AppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TStarNode } from 'types/design/types';

// utils
import { commitStarRatio } from '../commitStarRatio';

const star: TStarNode = {
  fills: [],
  flipX: false,
  flipY: false,
  height: 10,
  id: 'star',
  name: 'Star',
  parentId: null,
  points: 5,
  ratio: 0.382,
  rotation: 0,
  type: NodeType.star,
  width: 10,
  x: 0,
  y: 0,
};

describe('commitStarRatio', () => {
  it('should store the percentage as a ratio, rounded to a tenth of a percent and kept between 0.1% and 100%', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // before
    commitStarRatio(dispatch, [star], () => 50.04);
    commitStarRatio(dispatch, [star], () => 0);
    commitStarRatio(dispatch, [star], () => 150);

    // result
    expect(dispatch).toHaveBeenNthCalledWith(1, expect.objectContaining({ payload: { changes: { ratio: 0.5 }, id: 'star' } }));
    expect(dispatch).toHaveBeenNthCalledWith(2, expect.objectContaining({ payload: { changes: { ratio: 0.001 }, id: 'star' } }));
    expect(dispatch).toHaveBeenNthCalledWith(3, expect.objectContaining({ payload: { changes: { ratio: 1 }, id: 'star' } }));
  });
});
