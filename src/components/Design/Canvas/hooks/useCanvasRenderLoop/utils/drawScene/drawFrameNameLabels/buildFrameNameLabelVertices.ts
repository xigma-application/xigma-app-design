// others
import { FRAME_NAME_LABEL_FONT_SIZE_PX } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TFrameNode } from 'types/design/types';

// utils
import { buildGlyphQuads } from 'utils/canvas/text/buildGlyphQuads';
import { getFrameNameLabelAnchor } from './getFrameNameLabelAnchor';
import { getGlyphQuadBounds } from 'utils/canvas/text/getGlyphQuadBounds';
import { rotateGlyphVertices } from 'utils/canvas/text/rotateGlyphVertices';
import { translateGlyphVertices } from 'utils/canvas/text/translateGlyphVertices';
import { truncateTextToWidth } from 'utils/canvas/text/truncateTextToWidth';

export const buildFrameNameLabelVertices = (node: TFrameNode, zoom: number): Float32Array => {
  const fontSize = FRAME_NAME_LABEL_FONT_SIZE_PX / zoom;
  const { angleDeg, maxWidth, point } = getFrameNameLabelAnchor(node, zoom);
  const text = truncateTextToWidth(node.name, maxWidth, fontSize);
  const rawVertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [text], fontSize, 0, 0));
  const bounds = getGlyphQuadBounds(rawVertices);

  return bounds
    ? rotateGlyphVertices(translateGlyphVertices(rawVertices, point.x - bounds.minX, point.y - bounds.minY), point, angleDeg)
    : new Float32Array(0);
};
