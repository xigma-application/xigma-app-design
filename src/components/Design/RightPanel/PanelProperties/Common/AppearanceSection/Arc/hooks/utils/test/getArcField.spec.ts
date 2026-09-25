import { FocusEvent } from 'react';

// store
import { AppDispatch } from 'store';

// utils
import { getArcField } from '../getArcField';
import { makeEllipse } from './fixtures';

const blurEvent = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('getArcField', () => {
  it('should show the shared value with its unit and the field limits', () => {
    // before
    const field = getArcField(vi.fn() as unknown as AppDispatch, [makeEllipse({ arcRatio: 0.25 })], 'ratio');

    // result
    expect(field).toMatchObject({ displayValue: '25%', key: 'ratio', max: 100, min: 0, value: 25 });
  });

  it('should show Mixed when the ellipses differ', () => {
    // before
    const field = getArcField(vi.fn() as unknown as AppDispatch, [makeEllipse(), makeEllipse({ arcRatio: 0.5, id: 'b' })], 'ratio');

    // result
    expect(field.displayValue).toBe('Mixed');
  });

  it('should fall back to 0 without any ellipse', () => {
    // result
    expect(getArcField(vi.fn() as unknown as AppDispatch, [], 'start').value).toBe(0);
  });

  it('should commit a typed value on blur', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // before
    getArcField(dispatch, [makeEllipse()], 'ratio').onBlur(blurEvent('40%'));

    // result
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: { changes: { arcRatio: 0.4 }, id: 'ellipse' } }));
  });

  it('should put the shown value back after invalid input', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;
    const event = blurEvent('abc');

    // before
    getArcField(dispatch, [makeEllipse()], 'sweep').onBlur(event);

    // result
    expect(event.target.value).toBe('100%');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should move each ellipse by the scrubbed amount', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // before
    getArcField(dispatch, [makeEllipse({ arcRatio: 0.2 })], 'ratio').onScrub(30);

    // result
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ payload: { changes: { arcRatio: 0.3 }, id: 'ellipse' } }));
  });
});
