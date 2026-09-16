// others
import { UNSUPPORTED_IMAGE_MIME_TYPES } from '../constants';

export const isSupportedImageFile = (file: File): boolean =>
  file.type.startsWith('image/') && !UNSUPPORTED_IMAGE_MIME_TYPES.includes(file.type);
