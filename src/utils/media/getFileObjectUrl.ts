// others
import { OBJECT_URLS_BY_FILE_HASH } from './constants';

// utils
import { getFileHash } from './getFileHash';

export const getFileObjectUrl = async (file: Blob): Promise<string> => {
  const hash = await getFileHash(file);
  const cachedUrl = OBJECT_URLS_BY_FILE_HASH.get(hash);

  if (!cachedUrl) {
    const url = URL.createObjectURL(file);
    OBJECT_URLS_BY_FILE_HASH.set(hash, url);

    return url;
  }

  return cachedUrl;
};
