// store
import { AppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode, TStarNode } from 'types/design/types';

// utils
import { commitShapeCount } from '../commitShapeCount';

const polygon: TPolygonNode = {
  fills: [],
  flipX: false,
  flipY: false,
  height: 10,
  id: 'polygon',
  name: 'Polygon',
  parentId: null,
  rotation: 0,
  sides: 5,
  type: NodeType.polygon,
  width: 10,
  x: 0,
  y: 0,
};

describe('commitShapeCount', () => {
  it('should round the count and keep it between 3 and 60', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // before
    commitShapeCount(dispatch, [polygon], () => 6.6);
    commitShapeCount(dispatch, [polygon], () => 1);
    commitShapeCount(dispatch, [polygon], () => 99);

    // result
    expect(dispatch).toHaveBeenNthCalledWith(1, expect.objectContaining({ payload: { changes: { sides: 7 }, id: 'polygon' } }));
    expect(dispatch).toHaveBeenNthCalledWith(2, expect.objectContaining({ payload: { changes: { sides: 3 }, id: 'polygon' } }));
    expect(dispatch).toHaveBeenNthCalledWith(3, expect.objectContaining({ payload: { changes: { sides: 60 }, id: 'polygon' } }));
  });

  it('should set the points of a star', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;
    const star: TStarNode = { ...polygon, id: 'star', points: 5, ratio: 0.5, type: NodeType.star };

    // before
    commitShapeCount(dispatch, [star], () => 8);

    // result
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: { changes: { points: 8 }, id: 'star' } }));
  });
});
