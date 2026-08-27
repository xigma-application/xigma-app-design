// types
import { TVectorNode, TViewport } from 'types/design/types';
import { TVertexDotBuckets } from './types';

// utils
import { classifyVertexDots } from './classifyVertexDots';
import { drawImmediateVertexDots } from './drawImmediateVertexDots';

type TVertexDotClassificationCacheEntry = { classification: TVertexDotBuckets; key: string };

const classificationCache = new WeakMap<TVectorNode, TVertexDotClassificationCacheEntry>();

// The classification (which vertex lands in which batch) never depends on baseSize/viewport/canvas
// size — only on the node's own topology plus selection/new/hover state — so a pan- or zoom-only
// frame (the common case while idling in Vector Edit Mode) can reuse last frame's arrays wholesale
// instead of re-walking every vertex on the node.
const buildClassificationKey = (
  selectedVertexIds: ReadonlySet<string>,
  newVertexIds: ReadonlySet<string>,
  hoveredVertexId: string | null,
): string => `${[...selectedVertexIds].sort().join(',')}|${[...newVertexIds].sort().join(',')}|${hoveredVertexId ?? ''}`;

export const collectVertexDotBuckets = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  selectedVertexIds: ReadonlySet<string>,
  newVertexIds: ReadonlySet<string>,
  hoveredVertexId: string | null,
  baseSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): TVertexDotBuckets => {
  const key = buildClassificationKey(selectedVertexIds, newVertexIds, hoveredVertexId);
  const cached = classificationCache.get(node);
  const classification =
    cached && cached.key === key ? cached.classification : classifyVertexDots(node, selectedVertexIds, newVertexIds, hoveredVertexId);

  if (!cached || cached.key !== key) {
    classificationCache.set(node, { classification, key });
  }

  drawImmediateVertexDots(gl, program, buffer, node, selectedVertexIds, newVertexIds, hoveredVertexId, baseSize, canvasWidth, canvasHeight, viewport);

  return classification;
};
