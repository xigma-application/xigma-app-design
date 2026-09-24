// types
import { TDotBuffer } from './types';
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';

// utils
import { buildDotBuffer } from './buildDotBuffer';

const dotBufferByContext = new WeakMap<WebGL2RenderingContext, TDotBuffer>();

const releaseDotBuffer = (gl: WebGL2RenderingContext, cached: TDotBuffer | undefined): void => {
  if (cached) {
    gl.deleteBuffer(cached.buffer);
    dotBufferByContext.delete(gl);
  }
};

const buildAndStoreDotBuffer = (gl: WebGL2RenderingContext, layout: TSmartSelectionLayout, zoom: number): TDotBuffer | null => {
  const built = buildDotBuffer(gl, layout, zoom);

  if (built) {
    dotBufferByContext.set(gl, built);
  }

  return built;
};

export const getDotBuffer = (gl: WebGL2RenderingContext, layout: TSmartSelectionLayout, zoom: number): TDotBuffer | null => {
  const cached = dotBufferByContext.get(gl);

  if (!cached || cached.layout !== layout || cached.zoom !== zoom) {
    releaseDotBuffer(gl, cached);
    return buildAndStoreDotBuffer(gl, layout, zoom);
  }

  return cached;
};
