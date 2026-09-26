// others
import { translationNameSpace as parentNameSpace } from '../constants';
import { translationNameSpace as strokeTranslationNameSpace } from '../StrokeSection/constants';

// types
import { TImageFillMode } from 'shared/UITools/ColorPicker/Body/ImagePanel/types';
import { TPaintProperty } from 'types/design/paint/types';

export const translationNameSpace = `${parentNameSpace}.fillSection`;

export const getPaintTranslationNamespace = (property: TPaintProperty): string =>
  property === 'strokes' ? strokeTranslationNameSpace : translationNameSpace;

export const MULTI_SELECTION_DISABLED_FILL_MODES: TImageFillMode[] = ['crop', 'tile'];

export const VECTOR_DISABLED_FILL_MODES: TImageFillMode[] = ['crop'];
