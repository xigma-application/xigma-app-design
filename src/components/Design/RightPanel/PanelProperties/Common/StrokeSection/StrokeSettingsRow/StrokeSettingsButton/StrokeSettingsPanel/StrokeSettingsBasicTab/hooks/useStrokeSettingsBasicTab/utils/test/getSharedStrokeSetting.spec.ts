// types
import { TStrokeSettingsValues } from '../../types';

// utils
import { getSharedStrokeSetting } from '../getSharedStrokeSetting';

const values = (dashes: number[]): TStrokeSettingsValues => ({ dashes }) as TStrokeSettingsValues;

describe('getSharedStrokeSetting', () => {
  it('should return a deeply equal value shared by every stroke', () => {
    // result
    expect(getSharedStrokeSetting([values([4, 2]), values([4, 2])], 'dashes')).toEqual([4, 2]);
  });

  it('should return undefined when the value differs', () => {
    // result
    expect(getSharedStrokeSetting([values([4, 2]), values([1])], 'dashes')).toBeUndefined();
  });
});
