// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';
import { TVertexDotBufferCacheEntry } from './types';

// utils
import { getEllipsePoints } from 'utils/canvas/shapes/getEllipsePoints';
import { getOrCreateVertexDotBuffer } from './getOrCreateVertexDotBuffer';
import { hexToRgbaFloat } from 'utils/canvas/hexToRgbaFloat';
import { POINTS_PER_TRIANGLE } from './buildDotBatchVertices';

export const drawVectorVertexDotBatch = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  vertexDotBufferCache: WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>,
  centers: TPoint[],
  size: number,
  fill: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (centers.length > 0) {
    const unitRimPoints = getEllipsePoints({ height: size, width: size, x: -size / 2, y: -size / 2 }, ELLIPSE_SEGMENTS);
    const vertexCount = centers.length * unitRimPoints.length * POINTS_PER_TRIANGLE;

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
    const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

    gl.useProgram(program);
    gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
    gl.uniform1f(zoomLocation, viewport.zoom);
    gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
    gl.enableVertexAttribArray(positionLocation);

    getOrCreateVertexDotBuffer(gl, vertexDotBufferCache, buffer, centers, size, unitRimPoints);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(colorLocation, hexToRgbaFloat(fill));
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
};
