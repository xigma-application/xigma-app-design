import { FocusEvent } from 'react';

// store
import { AppDispatch } from 'store';

// utils
import { handleArcFieldBlur } from '../handleArcFieldBlur';
import { makeEllipse } from './fixtures';

const blurEvent = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('handleArcFieldBlur', () => {
  it('should commit a typed value to the ellipses', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // before
    handleArcFieldBlur(blurEvent('25%'), dispatch, [makeEllipse()], 'ratio', '0%');

    // result
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: { changes: { arcRatio: 0.25 }, id: 'ellipse' } }));
  });

  it('should put the shown value back after invalid input', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;
    const event = blurEvent('abc');

    // before
    handleArcFieldBlur(event, dispatch, [makeEllipse()], 'ratio', '0%');

    // result
    expect(event.target.value).toBe('0%');
    expect(dispatch).not.toHaveBeenCalled();
  });
});
