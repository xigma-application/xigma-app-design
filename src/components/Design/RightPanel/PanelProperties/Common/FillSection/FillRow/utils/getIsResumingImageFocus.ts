// types
import { TImageFillPickerFocus } from 'store/design/types';

export const getIsResumingImageFocus = (
  isMedia: boolean,
  imageFillPickerFocus: TImageFillPickerFocus | null,
  nodeId: string | undefined,
  paintIndex: number,
): boolean => isMedia && imageFillPickerFocus?.nodeId === nodeId && imageFillPickerFocus?.paintIndex === paintIndex;
