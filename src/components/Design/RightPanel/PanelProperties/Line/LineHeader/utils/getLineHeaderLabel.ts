import { TFunction } from 'i18next';

// others
import { translationNameSpace } from '../constants';
import { translationNameSpace as mixedNameSpace } from '../../../Mixed/constants';

export const getLineHeaderLabel = (t: TFunction, count: number, arrowCount: number): string => {
  switch (arrowCount) {
    case 0:
      return t(`${translationNameSpace}.label`);
    case count:
      return t(`${translationNameSpace}.arrowLabel`);
    default:
      return t(`${mixedNameSpace}.header.label`, { count });
  }
};
