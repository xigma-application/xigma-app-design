// utils
import { deleteGlassEntryResources } from './deleteGlassEntryResources';
import { glassCaches } from './glassCaches';

export const deleteGlassCacheEntry = (gl: WebGL2RenderingContext, nodeId: string): void => {
  const cache = glassCaches.get(gl);
  const entry = cache?.get(nodeId);

  if (cache && entry) {
    deleteGlassEntryResources(gl, entry);
    cache.delete(nodeId);
  }
};
