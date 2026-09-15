// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TPatternPaint } from 'types/design/paint/types';
import { TViewport } from 'types/design/types';

// utils
import { getOrCreateFaceBuffer } from './getOrCreateFaceBuffer';
import { getPatternHexOffsetAxis } from './getPatternHexOffsetAxis';
import { getPatternTileGridFractions } from './getPatternTileGridFractions';
import { getVectorFillBounds } from './getVectorFillBounds';
import { getVectorFillCoveringQuad } from './getVectorFillCoveringQuad';
import { worldPointToTextureUV } from '../worldPointToTextureUV';

export type TPatternSourceTile = {
  height: number;
  texture: WebGLTexture;
  width: number;
  x: number;
  y: number;
};

export const drawVectorPatternSourceTile = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null,
  nodeBounds: TDraftRect | null,
  faces: TPoint[][],
  sourceTile: TPatternSourceTile,
  paint: TPatternPaint,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isAlphaWriteEnabled: boolean,
  alpha = 1,
): void => {
  if (faces.length !== 0) {
    const bounds = getVectorFillBounds(faces, nodeBounds);
    const tileWorldWidth = Math.max(sourceTile.width * (paint.scale / 100), 1);
    const tileWorldHeight = Math.max(sourceTile.height * (paint.scale / 100), 1);
    const { alignFrac, periodFrac, tileFrac } = getPatternTileGridFractions(bounds, tileWorldWidth, tileWorldHeight, paint);
    const hexOffsetAxis = getPatternHexOffsetAxis(paint);
    const topLeftUV = worldPointToTextureUV({ x: sourceTile.x, y: sourceTile.y }, viewport, canvasWidth, canvasHeight);
    const point = { x: sourceTile.x + sourceTile.width, y: sourceTile.y + sourceTile.height };
    const bottomRightUV = worldPointToTextureUV(point, viewport, canvasWidth, canvasHeight);
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
    const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const translateLocation = gl.getUniformLocation(program, 'u_translate');
    const boundsOriginLocation = gl.getUniformLocation(program, 'u_boundsOrigin');
    const boundsSizeLocation = gl.getUniformLocation(program, 'u_boundsSize');
    const textureLocation = gl.getUniformLocation(program, 'u_texture');
    const periodFracLocation = gl.getUniformLocation(program, 'u_periodFrac');
    const tileFracLocation = gl.getUniformLocation(program, 'u_tileFrac');
    const alignFracLocation = gl.getUniformLocation(program, 'u_alignFrac');
    const tileOriginUVLocation = gl.getUniformLocation(program, 'u_tileOriginUV');
    const tileSizeUVLocation = gl.getUniformLocation(program, 'u_tileSizeUV');
    const opacityLocation = gl.getUniformLocation(program, 'u_opacity');
    const hexOffsetAxisLocation = gl.getUniformLocation(program, 'u_hexOffsetAxis');

    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sourceTile.texture);
    gl.uniform1i(textureLocation, 0);
    gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
    gl.uniform1f(zoomLocation, viewport.zoom);
    gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
    gl.uniform2f(translateLocation, 0, 0);
    gl.uniform2f(boundsOriginLocation, bounds.x, bounds.y);
    gl.uniform2f(boundsSizeLocation, bounds.width, bounds.height);
    gl.uniform2f(periodFracLocation, periodFrac.x, periodFrac.y);
    gl.uniform2f(tileFracLocation, tileFrac.x, tileFrac.y);
    gl.uniform2f(alignFracLocation, alignFrac.x, alignFrac.y);
    gl.uniform2f(tileOriginUVLocation, topLeftUV.x, topLeftUV.y);
    gl.uniform2f(tileSizeUVLocation, bottomRightUV.x - topLeftUV.x, bottomRightUV.y - topLeftUV.y);
    gl.uniform1f(opacityLocation, alpha);
    gl.uniform1i(hexOffsetAxisLocation, hexOffsetAxis);
    gl.enableVertexAttribArray(positionLocation);

    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.enable(gl.STENCIL_TEST);
    gl.colorMask(false, false, false, false);
    gl.stencilFunc(gl.ALWAYS, 1, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);

    faces.forEach((face: TPoint[]) => {
      getOrCreateFaceBuffer(gl, faceBufferCache, buffer, face);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, face.length);
    });

    gl.colorMask(true, true, true, isAlphaWriteEnabled);
    gl.stencilFunc(gl.NOTEQUAL, 0, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getVectorFillCoveringQuad(faces, nodeBounds)), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.disable(gl.STENCIL_TEST);
  }
};
