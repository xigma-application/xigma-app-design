import { FocusEvent } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { handleOpacityBlur } from '../handleOpacityBlur';

const node = { id: 'rectangle', type: NodeType.rectangle } as TRectangleNode;

const blurEvent = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('handleOpacityBlur', () => {
  it('should commit a typed percentage, clamped to 100%', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // before
    handleOpacityBlur(blurEvent('150%'), dispatch, [node], '50%');

    // result
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: { changes: { opacity: 1 }, id: 'rectangle' } }));
  });

  it('should put the shown value back after invalid input', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;
    const event = blurEvent('abc');

    // before
    handleOpacityBlur(event, dispatch, [node], '50%');

    // result
    expect(event.target.value).toBe('50%');
    expect(dispatch).not.toHaveBeenCalled();
  });
});
