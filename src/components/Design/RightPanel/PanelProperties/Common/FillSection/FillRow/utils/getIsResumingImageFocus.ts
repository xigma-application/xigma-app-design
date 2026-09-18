// types
import { TImageFillPickerFocus } from 'store/design/types';

// types
import { TPaintProperty } from 'types/design/paint/types';

export const getIsResumingImageFocus = (
  isMedia: boolean,
  imageFillPickerFocus: TImageFillPickerFocus | null,
  nodeId: string | undefined,
  paintIndex: number,
  property: TPaintProperty = 'fills',
): boolean =>
  isMedia &&
  imageFillPickerFocus?.nodeId === nodeId &&
  imageFillPickerFocus?.paintIndex === paintIndex &&
  (imageFillPickerFocus?.property ?? 'fills') === property;
