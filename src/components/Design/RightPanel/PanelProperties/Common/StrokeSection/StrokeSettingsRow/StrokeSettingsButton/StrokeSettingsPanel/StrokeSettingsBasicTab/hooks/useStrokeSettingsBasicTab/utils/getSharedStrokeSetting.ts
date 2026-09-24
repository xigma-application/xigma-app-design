import { isEqual } from 'lodash';

// types
import { TStrokeSettingsValues } from '../types';

export const getSharedStrokeSetting = <TKey extends keyof TStrokeSettingsValues>(
  valuesList: TStrokeSettingsValues[],
  key: TKey,
): TStrokeSettingsValues[TKey] | undefined =>
  valuesList.every((values) => isEqual(values[key], valuesList[0][key])) ? valuesList[0][key] : undefined;
