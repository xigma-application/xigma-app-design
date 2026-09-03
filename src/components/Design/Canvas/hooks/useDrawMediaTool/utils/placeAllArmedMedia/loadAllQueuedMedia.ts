// utils
import { loadArmedMedia, TArmedMedia } from '../loadArmedMedia';

export const loadAllQueuedMedia = (armed: TArmedMedia | null, queue: File[]): Promise<TArmedMedia[]> => {
  const loadedQueue = Promise.all(queue.map((file) => new Promise<TArmedMedia>((resolve) => loadArmedMedia(file, resolve))));
  return loadedQueue.then((queued) => (armed ? [armed, ...queued] : queued));
};
