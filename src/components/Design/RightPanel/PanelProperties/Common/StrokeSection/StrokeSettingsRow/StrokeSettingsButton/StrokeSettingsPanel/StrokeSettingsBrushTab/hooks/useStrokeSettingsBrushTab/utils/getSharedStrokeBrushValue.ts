// types
import { TStrokeBrushValues } from 'utils/design/stroke/getStrokeBrushValues';

export const getSharedStrokeBrushValue = <TKey extends keyof TStrokeBrushValues>(
  valuesList: TStrokeBrushValues[],
  key: TKey,
): TStrokeBrushValues[TKey] | undefined =>
  valuesList.every((values) => values[key] === valuesList[0][key]) ? valuesList[0][key] : undefined;
