// @xigma
import { BRUSH_CATEGORIES } from '@xigma/utils';

// components
import StrokeBrushPreview from '../StrokeBrushPreview/StrokeBrushPreview';

// types
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

// utils
import { getBrushImageUrl } from 'utils/brushes/getBrushImageUrl';

export const getStrokeBrushOptions = (getLabel: (translationKey: string) => string): TDropdownOption<string>[] =>
  BRUSH_CATEGORIES.flatMap((category) => category.brushes).map((brush) => ({
    content: <StrokeBrushPreview label={getLabel(brush.labelTranslationKey)} src={getBrushImageUrl(brush.imageFile)} />,
    label: getLabel(brush.labelTranslationKey),
    value: brush.id,
  }));
