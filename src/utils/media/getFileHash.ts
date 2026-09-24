// others
import { FILE_HASH_PROMISES } from './constants';

// utils
import { computeFileHash } from './computeFileHash';

export const getFileHash = (file: Blob): Promise<string> => {
  const cachedHash = FILE_HASH_PROMISES.get(file);

  if (!cachedHash) {
    const hash = computeFileHash(file);
    FILE_HASH_PROMISES.set(file, hash);

    return hash;
  }

  return cachedHash;
};
