import { FocusEvent } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TStarNode } from 'types/design/types';

// utils
import { handleStarRatioBlur } from '../handleStarRatioBlur';

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

const blurEvent = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as unknown as FocusEvent<HTMLInputElement>;

describe('handleStarRatioBlur', () => {
  it('should commit a typed percentage', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // before
    handleStarRatioBlur(blurEvent('25%'), dispatch, [star], '38.2%');

    // result
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: { changes: { ratio: 0.25 }, id: 'star' } }));
  });

  it('should put the shown value back for invalid input', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;
    const event = blurEvent('abc');

    // before
    handleStarRatioBlur(event, dispatch, [star], '38.2%');

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(event.target.value).toBe('38.2%');
  });
});
