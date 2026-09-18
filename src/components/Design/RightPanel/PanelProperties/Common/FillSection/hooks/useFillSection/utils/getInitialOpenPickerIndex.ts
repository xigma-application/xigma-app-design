// store
import { TImageFillPickerFocus } from 'store/design/types';

// types
import { TPaintProperty } from 'types/design/paint/types';

export const getInitialOpenPickerIndex = (
  property: TPaintProperty,
  imageFillPickerFocus: TImageFillPickerFocus | null,
  nodeId: string | undefined,
): number | null => {
  if (imageFillPickerFocus && imageFillPickerFocus.nodeId === nodeId && (imageFillPickerFocus.property ?? 'fills') === property) {
    return imageFillPickerFocus.paintIndex;
  }

  return null;
};
