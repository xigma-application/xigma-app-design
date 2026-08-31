// types
import { TEllipseArcLengthSample, TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';
import { TSceneNode, TTextNode, TViewport } from 'types/design/types';

// utils
import { drawMsdfGlyphs } from './drawMsdfGlyphs';
import { flipGlyphVertices } from './flipGlyphVertices';
import { getOrBuildTextGeometry, TTextGeometry } from './getOrBuildTextGeometry';
import { rotateVertices } from '../rotateVertices';

export const drawMsdfText = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  texture: WebGLTexture | null,
  atlas: TGlyphAtlasJson,
  cache: Map<string, TTextGeometry>,
  ellipseArcLengthCache: Map<string, TEllipseArcLengthSample[]>,
  node: TTextNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  pathNode?: TSceneNode,
): void => {
  if (texture) {
    const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    const geometry = getOrBuildTextGeometry(atlas, cache, node, ellipseArcLengthCache, pathNode);
    const vertices = rotateVertices(flipGlyphVertices(geometry.vertices, node), center, node.rotation);

    drawMsdfGlyphs(
      gl,
      program,
      buffer,
      texture,
      atlas,
      vertices,
      node.fill,
      geometry.effectiveFontSize,
      canvasWidth,
      canvasHeight,
      viewport,
      node.strokeColor,
      node.strokeWidth,
    );
  }
};
