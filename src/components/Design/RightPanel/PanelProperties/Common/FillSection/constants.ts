// others
import { translationNameSpace as parentNameSpace } from '../constants';
import { translationNameSpace as strokeTranslationNameSpace } from '../StrokeSection/constants';

// types
import { TPaintProperty } from 'types/design/paint/types';

export const translationNameSpace = `${parentNameSpace}.fillSection`;

export const getPaintTranslationNamespace = (property: TPaintProperty): string =>
  property === 'strokes' ? strokeTranslationNameSpace : translationNameSpace;
