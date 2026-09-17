// store
import { selectImageEditor, selectNodes, selectViewport } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TPoint } from 'types/canvas';

// utils
import { getImageCropExpandButtonPosition } from '../utils/getImageCropExpandButtonPosition';

export const useImageCropExpandButton = (): TPoint | null => {
  const imageEditor = useAppSelector(selectImageEditor);
  const nodes = useAppSelector(selectNodes);
  const viewport = useAppSelector(selectViewport);

  return getImageCropExpandButtonPosition(imageEditor, nodes, viewport);
};
