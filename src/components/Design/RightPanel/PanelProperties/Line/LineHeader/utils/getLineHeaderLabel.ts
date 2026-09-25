import { TFunction } from 'i18next';

// others
import { translationNameSpace } from '../constants';
import { translationNameSpace as mixedNameSpace } from '../../../Mixed/constants';

export const getLineHeaderLabel = (t: TFunction, count: number, arrowCount: number): string => {
  switch (true) {
    case count > 1:
      return t(`${mixedNameSpace}.header.label`, { count });
    case arrowCount > 0:
      return t(`${translationNameSpace}.arrowLabel`);
    default:
      return t(`${translationNameSpace}.label`);
  }
};
