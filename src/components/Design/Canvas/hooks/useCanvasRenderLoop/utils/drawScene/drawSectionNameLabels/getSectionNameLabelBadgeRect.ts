// others
import {
  FRAME_NAME_LABEL_FONT_SIZE_PX,
  FRAME_NAME_LABEL_GAP_PX,
  SECTION_NAME_LABEL_NESTED_INSET_PX,
  SECTION_NAME_LABEL_PADDING_X_PX,
  SECTION_NAME_LABEL_PADDING_Y_PX,
} from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TSectionNode } from 'types/design/types';

// utils
import { buildGlyphQuads } from 'utils/canvas/text/buildGlyphQuads';
import { getGlyphQuadBounds } from 'utils/canvas/text/getGlyphQuadBounds';
import { truncateTextToWidth } from 'utils/canvas/text/truncateTextToWidth';

export type TSectionNameLabelBadgeRect = {
  height: number;
  text: string;
  textHeight: number;
  width: number;
  x: number;
  y: number;
};

type TBadgeMemo = { badge: TSectionNameLabelBadgeRect | null; isNested: boolean; zoom: number };

const badgeByNode = new WeakMap<TSectionNode, TBadgeMemo>();

const buildBadgeRect = (node: TSectionNode, zoom: number, isNested: boolean): TSectionNameLabelBadgeRect | null => {
  const fontSize = FRAME_NAME_LABEL_FONT_SIZE_PX / zoom;
  const paddingX = SECTION_NAME_LABEL_PADDING_X_PX / zoom;
  const paddingY = SECTION_NAME_LABEL_PADDING_Y_PX / zoom;
  const gap = FRAME_NAME_LABEL_GAP_PX / zoom;
  const inset = isNested ? SECTION_NAME_LABEL_NESTED_INSET_PX / zoom : 0;
  const maxTextWidth = Math.max(node.width - inset * 2 - paddingX * 2, 0);
  const text = truncateTextToWidth(node.name, maxTextWidth, fontSize);
  const rawVertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, [text], fontSize, 0, 0));
  const bounds = getGlyphQuadBounds(rawVertices);

  if (bounds) {
    const textHeight = bounds.maxY - bounds.minY;
    const width = bounds.maxX - bounds.minX + paddingX * 2;
    const height = textHeight + paddingY * 2;

    return { height, text, textHeight, width, x: node.x + inset, y: isNested ? node.y + inset : node.y - gap - height };
  }

  return null;
};

export const getSectionNameLabelBadgeRect = (node: TSectionNode, zoom: number, isNested = false): TSectionNameLabelBadgeRect | null => {
  const cached = badgeByNode.get(node);

  if (!cached || cached.zoom !== zoom || cached.isNested !== isNested) {
    const badge = buildBadgeRect(node, zoom, isNested);
    badgeByNode.set(node, { badge, isNested, zoom });

    return badge;
  }

  return cached.badge;
};
