// store
import { TImageFillPickerFocus } from 'store/design/types';

// types
import { TPaintProperty } from 'types/design/paint/types';

export const getInitialOpenPickerIndex = (
  property: TPaintProperty,
  imageFillPickerFocus: TImageFillPickerFocus | null,
  nodeId: string | undefined,
): number | null => {
  if (property === 'fills') {
    if (imageFillPickerFocus && imageFillPickerFocus.nodeId === nodeId) {
      return imageFillPickerFocus.paintIndex;
    }
  }

  return null;
};
