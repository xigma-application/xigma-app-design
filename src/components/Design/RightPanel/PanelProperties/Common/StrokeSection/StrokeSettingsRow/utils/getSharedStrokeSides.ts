// types
import { StrokeSides } from 'types/design/enums';

// utils
import { getSharedStrokeSetting } from './getSharedStrokeSetting';

export const getSharedStrokeSides = (sidesList: StrokeSides[]): StrokeSides | undefined => {
  const shared = getSharedStrokeSetting(sidesList, StrokeSides.all);
  const isCustomCompatible = sidesList.every((sides) => sides === StrokeSides.all || sides === StrokeSides.custom);

  return shared ?? (isCustomCompatible ? StrokeSides.custom : undefined);
};
