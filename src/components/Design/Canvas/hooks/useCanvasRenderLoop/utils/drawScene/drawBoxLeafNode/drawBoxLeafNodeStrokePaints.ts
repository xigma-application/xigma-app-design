// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TFrameNode, TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';
import { TPathOutlineStyle } from '../getPathOutlineStyles';

// types (enums)
import { StrokeMode } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { drawBoxPaints } from './drawBoxPaints';
import { getBoxStrokeRingPolygons } from '../getBoxStrokeRingPolygons/getBoxStrokeRingPolygons';

const BRUSH_FACE_BUFFERS = new WeakMap<TPoint[], WebGLBuffer>();

export const drawBoxLeafNodeStrokePaints = (
  context: TDrawSceneContext,
  node: TFrameNode | TRectangleNode | TSectionNode,
  opacity: number,
  nodesById: Record<string, TSceneNode>,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth: number,
): void => {
  if ('fills' in node && node.strokes && node.strokes.length > 0 && node.strokeWidth) {
    const polygons = getBoxStrokeRingPolygons(node);
    const faceBufferCache = 'strokeMode' in node && node.strokeMode === StrokeMode.brush ? BRUSH_FACE_BUFFERS : null;

    drawBoxPaints(
      context,
      node,
      node.strokes,
      polygons,
      opacity,
      nodesById,
      pathOutlineStyles,
      refs,
      editingPathId,
      patternSourceDepth,
      faceBufferCache,
    );
  }
};
