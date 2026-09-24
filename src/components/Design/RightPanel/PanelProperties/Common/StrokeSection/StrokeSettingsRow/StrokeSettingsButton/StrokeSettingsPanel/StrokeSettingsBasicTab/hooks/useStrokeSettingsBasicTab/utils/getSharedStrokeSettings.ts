// types
import { TSharedStrokeSettings, TStrokeSettingsValues } from '../types';

// utils
import { getSharedStrokeSetting } from './getSharedStrokeSetting';

export const getSharedStrokeSettings = (valuesList: TStrokeSettingsValues[]): TSharedStrokeSettings => ({
  dash: getSharedStrokeSetting(valuesList, 'dash'),
  dashCap: getSharedStrokeSetting(valuesList, 'dashCap'),
  dashes: getSharedStrokeSetting(valuesList, 'dashes'),
  gap: getSharedStrokeSetting(valuesList, 'gap'),
  hasDashes: valuesList.every((values) => values.hasDashes),
  isCustom: valuesList.every((values) => values.isCustom),
  isDashed: valuesList.every((values) => values.isDashed),
  isMiter: valuesList.every((values) => values.isMiter),
  isWidthProfileDisabled: valuesList.some((values) => values.hasDashes),
  join: getSharedStrokeSetting(valuesList, 'join'),
  miterAngle: getSharedStrokeSetting(valuesList, 'miterAngle'),
  style: getSharedStrokeSetting(valuesList, 'style'),
});
