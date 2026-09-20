// types
import { TGlassCacheEntry, TScissorRect } from './types';

// utils
import { glassCaches } from './glassCaches';

export const getGlassCacheHit = (
  gl: WebGL2RenderingContext,
  nodeId: string,
  nodesState: unknown,
  rect: TScissorRect,
): TGlassCacheEntry | undefined => {
  const entry = glassCaches.get(gl)?.get(nodeId);

  // position isn't checked: a pure pan moves the shape and its backdrop together, so the exact
  // same captured content is still correct at the shape's new screen position — only its size
  // (which changes with zoom, corner radius, effect margins, ...) has to match to reuse it
  if (entry && entry.nodesState === nodesState && entry.width === rect.width && entry.height === rect.height) {
    return entry;
  }
};
