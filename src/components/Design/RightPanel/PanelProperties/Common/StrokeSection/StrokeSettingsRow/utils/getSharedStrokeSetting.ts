// utils
import { getSharedValue } from './getSharedValue';

export const getSharedStrokeSetting = <TValue>(values: TValue[], emptyValue: TValue): TValue | undefined =>
  values.length > 0 ? getSharedValue(values) : emptyValue;
