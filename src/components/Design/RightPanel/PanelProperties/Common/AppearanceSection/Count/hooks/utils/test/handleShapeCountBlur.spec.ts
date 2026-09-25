import { FocusEvent } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode } from 'types/design/types';

// utils
import { handleShapeCountBlur } from '../handleShapeCountBlur';

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

const blurEvent = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as unknown as FocusEvent<HTMLInputElement>;

describe('handleShapeCountBlur', () => {
  it('should commit a typed count', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // before
    handleShapeCountBlur(blurEvent('8'), dispatch, [polygon], '5');

    // result
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: { changes: { sides: 8 }, id: 'polygon' } }));
  });

  it('should put the shown value back for invalid input', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;
    const event = blurEvent('abc');

    // before
    handleShapeCountBlur(event, dispatch, [polygon], '5');

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(event.target.value).toBe('5');
  });
});
