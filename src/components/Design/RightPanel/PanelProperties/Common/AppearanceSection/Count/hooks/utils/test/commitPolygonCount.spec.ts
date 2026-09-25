// store
import { AppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode } from 'types/design/types';

// utils
import { commitPolygonCount } from '../commitPolygonCount';

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

describe('commitPolygonCount', () => {
  it('should round the count and keep it between 3 and 60', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // before
    commitPolygonCount(dispatch, [polygon], () => 6.6);
    commitPolygonCount(dispatch, [polygon], () => 1);
    commitPolygonCount(dispatch, [polygon], () => 99);

    // result
    expect(dispatch).toHaveBeenNthCalledWith(1, expect.objectContaining({ payload: { changes: { sides: 7 }, id: 'polygon' } }));
    expect(dispatch).toHaveBeenNthCalledWith(2, expect.objectContaining({ payload: { changes: { sides: 3 }, id: 'polygon' } }));
    expect(dispatch).toHaveBeenNthCalledWith(3, expect.objectContaining({ payload: { changes: { sides: 60 }, id: 'polygon' } }));
  });
});
