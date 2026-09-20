// hooks
import { useActiveViewport } from 'hooks/useActiveViewport/useActiveViewport';

// store
import { selectImageEditor, selectNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TPoint } from 'types/canvas';

// utils
import { getImageCropExpandButtonPosition } from '../utils/getImageCropExpandButtonPosition';

export const useImageCropExpandButton = (): TPoint | null => {
  const imageEditor = useAppSelector(selectImageEditor);
  const nodes = useAppSelector(selectNodes);
  const viewport = useActiveViewport(imageEditor !== null);

  return getImageCropExpandButtonPosition(imageEditor, nodes, viewport);
};
