// store
import { useAppSelector } from 'store';

// utils
import { selectSelectedImageCrop } from '../utils/selectSelectedImageCrop';

export const useIsEditingImageCrop = (): boolean => useAppSelector((state) => Boolean(selectSelectedImageCrop(state)));
