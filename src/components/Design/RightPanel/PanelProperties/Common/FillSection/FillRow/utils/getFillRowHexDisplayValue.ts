import { TFunction } from 'i18next';

// types
import { GRADIENT_TYPE_LABEL_KEY } from 'shared/UITools/ColorPicker/Body/GradientPanel/constants';
import { TPaint } from 'types/design/paint/types';

// others
import { translationNameSpace } from '../../constants';

export const getFillRowHexDisplayValue = (paint: TPaint, t: TFunction): string | undefined => {
  switch (paint.type) {
    case 'pattern':
      return 'Pattern';
    case 'image':
      return t(`${translationNameSpace}.imageLabel`);
    case 'solid':
      return undefined;
    default:
      return t(GRADIENT_TYPE_LABEL_KEY[paint.type]);
  }
};
