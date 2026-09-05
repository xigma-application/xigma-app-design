// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TDrawSceneContext } from './types';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { drawMsdfText } from 'utils/canvas/text/drawMsdfText';
import { getMsdfAtlasTexture } from 'utils/canvas/text/getMsdfAtlasTexture';

export const drawTextLeafNode = (context: TDrawSceneContext, node: TTextNode, nodesById: Record<string, TSceneNode>): void => {
  const { canvasHeight, canvasWidth, gl, imageContext, viewport } = context;

  drawMsdfText(
    gl,
    imageContext.msdfProgram,
    imageContext.msdfBuffer,
    getMsdfAtlasTexture(gl, imageContext.cache),
    MSDF_ATLAS_JSON,
    imageContext.textGeometryCache,
    imageContext.ellipseArcLengthCache,
    node,
    canvasWidth,
    canvasHeight,
    viewport,
    node.pathId ? nodesById[node.pathId] : undefined,
  );
};
